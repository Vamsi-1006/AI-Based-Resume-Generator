import { api, API_BASE_URL } from "./client";

export const getProviders = async () => (await api.get("/llm/providers")).data;

/** description -> { data: resume, meta } */
export const generateResume = async (description, provider) =>
  (await api.post("/resume/generate", { userDescription: description, provider: provider || null })).data;

export const atsScore = async (resume, jobDescription, provider) =>
  (await api.post("/resume/ats-score", { resume, jobDescription, provider: provider || null })).data;

export const tailorResume = async (resume, jobDescription, provider) =>
  (await api.post("/resume/tailor", { resume, jobDescription, provider: provider || null })).data;

export const interviewPrep = async (resume, jobDescription, provider) =>
  (await api.post("/resume/interview-prep", { resume, jobDescription, provider: provider || null })).data;

export const improveText = async ({ section, text, targetRole, provider }) =>
  (await api.post("/resume/improve", { section, text, targetRole, provider: provider || null })).data;

export const sendContact = async (payload) => (await api.post("/contact", payload)).data;

/**
 * Streams a cover letter via Server-Sent Events over a POST request.
 * Handlers: onMeta({provider, model}), onToken(text), onDone(), onError(message)
 * Returns an AbortController so the caller can stop generation.
 */
export function streamCoverLetter(payload, { onMeta, onToken, onDone, onError }) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/resume/cover-letter/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by a blank line
        let sep;
        while ((sep = buffer.search(/\r?\n\r?\n/)) >= 0) {
          const raw = buffer.slice(0, sep);
          buffer = buffer.slice(sep).replace(/^\r?\n\r?\n/, "");
          let event = "message";
          const dataLines = [];
          raw.split(/\r?\n/).forEach((line) => {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
          });
          if (!dataLines.length) continue;
          const data = JSON.parse(dataLines.join("\n"));
          if (event === "meta") onMeta?.(data);
          else if (event === "token") onToken?.(data.t);
          else if (event === "error") onError?.(data.message);
        }
      }
      onDone?.();
    } catch (e) {
      if (e.name !== "AbortError") onError?.(e.message || "Streaming failed");
    }
  })();

  return controller;
}
