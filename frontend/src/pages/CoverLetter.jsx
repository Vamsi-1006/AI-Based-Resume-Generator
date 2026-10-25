import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelopeOpenText, FaStop, FaCopy, FaDownload } from "react-icons/fa";
import { streamCoverLetter } from "../api/ResumeService";
import ResumePicker from "../components/ResumePicker";
import ProviderSelect from "../components/ProviderSelect";
import useProviders from "../hooks/useProviders";
import { downloadBlob } from "../utils/storage";

const TONES = ["Professional", "Enthusiastic", "Confident", "Concise", "Friendly"];

function CoverLetter() {
  const { providers, provider, setProvider, backendUp } = useProviders();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ companyName: "", hiringManager: "", tone: "Professional", jobDescription: "" });
  const [letter, setLetter] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [servedBy, setServedBy] = useState(null);
  const controllerRef = useRef(null);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const generate = () => {
    if (!selected) return toast.error("Select a resume first");
    if (form.jobDescription.trim().length < 50) return toast.error("Paste the job description (at least 50 characters)");

    setLetter("");
    setServedBy(null);
    setStreaming(true);
    controllerRef.current = streamCoverLetter(
      { resume: selected.data, ...form, provider: provider || null },
      {
        onMeta: (m) => setServedBy(m),
        onToken: (t) => setLetter((prev) => prev + t),
        onDone: () => setStreaming(false),
        onError: (msg) => {
          setStreaming(false);
          toast.error(msg, { duration: 6000 });
        },
      }
    );
  };

  const stop = () => {
    controllerRef.current?.abort();
    setStreaming(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 flex items-center justify-center gap-2">
        <FaEnvelopeOpenText className="text-accent" /> Cover Letter Generator
      </h1>
      <p className="text-center opacity-70 mb-8">Written from your resume, targeted at the job - streamed live.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-base-200 rounded-box p-6 space-y-3">
          <ResumePicker value={selected} onChange={setSelected} />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="form-control">
              <div className="label"><span className="label-text">Company</span></div>
              <input className="input input-bordered input-sm" value={form.companyName} onChange={update("companyName")} placeholder="e.g. Microsoft" />
            </label>
            <label className="form-control">
              <div className="label"><span className="label-text">Hiring manager (optional)</span></div>
              <input className="input input-bordered input-sm" value={form.hiringManager} onChange={update("hiringManager")} placeholder="e.g. Ms. Rao" />
            </label>
          </div>
          <label className="form-control">
            <div className="label"><span className="label-text">Tone</span></div>
            <div className="join">
              {TONES.map((t) => (
                <input
                  key={t}
                  type="radio"
                  name="tone"
                  aria-label={t}
                  className="join-item btn btn-sm"
                  checked={form.tone === t}
                  onChange={() => setForm((f) => ({ ...f, tone: t }))}
                />
              ))}
            </div>
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">Job description</span></div>
            <textarea className="textarea textarea-bordered h-40" value={form.jobDescription} onChange={update("jobDescription")} placeholder="Paste the job description…" />
          </label>
          <ProviderSelect providers={providers} value={provider} onChange={setProvider} backendUp={backendUp} />
          <div className="flex gap-2">
            {!streaming ? (
              <button className="btn btn-primary" onClick={generate} disabled={!backendUp}>
                <FaEnvelopeOpenText /> Generate
              </button>
            ) : (
              <button className="btn btn-error" onClick={stop}>
                <FaStop /> Stop
              </button>
            )}
          </div>
        </div>

        <div className="bg-base-100 border border-base-300 rounded-box p-6 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Your cover letter</h2>
            <div className="flex gap-2">
              {servedBy && <span className="badge badge-ghost text-xs">via {servedBy.provider}</span>}
              <button className="btn btn-ghost btn-xs" onClick={copy} disabled={!letter || streaming}><FaCopy /> Copy</button>
              <button
                className="btn btn-ghost btn-xs"
                disabled={!letter || streaming}
                onClick={() => downloadBlob(new Blob([letter], { type: "text/plain" }), `Cover_Letter_${form.companyName || "draft"}.txt`)}
              >
                <FaDownload /> .txt
              </button>
            </div>
          </div>
          {streaming || !letter ? (
            <div className={`flex-1 whitespace-pre-wrap leading-relaxed ${streaming ? "stream-caret" : "opacity-50"}`}>
              {letter || (streaming ? "" : "Your letter will appear here as it's written. You can edit it afterwards.")}
            </div>
          ) : (
            <textarea className="textarea textarea-bordered flex-1 leading-relaxed text-base" value={letter} onChange={(e) => setLetter(e.target.value)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CoverLetter;
