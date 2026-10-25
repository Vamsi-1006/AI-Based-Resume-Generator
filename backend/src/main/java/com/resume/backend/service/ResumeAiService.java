package com.resume.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resume.backend.dto.AiResult;
import com.resume.backend.dto.CoverLetterRequest;
import com.resume.backend.dto.ImproveRequest;
import com.resume.backend.dto.JobMatchRequest;
import com.resume.backend.llm.LlmException;
import com.resume.backend.llm.LlmProvider;
import com.resume.backend.llm.LlmRequest;
import com.resume.backend.llm.LlmResponse;
import com.resume.backend.llm.LlmRouter;
import com.resume.backend.prompt.PromptTemplateService;
import com.resume.backend.util.JsonExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * All AI use-cases. Each one = prompt template + LLM call + JSON parsing/repair + normalization.
 */
@Service
public class ResumeAiService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAiService.class);
    private static final TypeReference<Map<String, Object>> MAP = new TypeReference<>() { };

    private final LlmRouter router;
    private final PromptTemplateService prompts;
    private final ResponseCache cache;
    private final ObjectMapper mapper;

    public ResumeAiService(LlmRouter router, PromptTemplateService prompts, ResponseCache cache, ObjectMapper mapper) {
        this.router = router;
        this.prompts = prompts;
        this.cache = cache;
        this.mapper = mapper;
    }

    // ---------------------------------------------------------------- generate
    public AiResult generate(String description, String provider) {
        return cached("generate", provider, () -> {
            String user = prompts.render("generate_resume", Map.of(
                    "userDescription", description.trim(),
                    "today", LocalDate.now().toString()));
            LlmResponse r = router.chat(LlmRequest.json(system(), user), provider);
            Map<String, Object> resume = ResumeNormalizer.normalize(parseJson(r));
            return new AiResult(resume, meta(r));
        }, description);
    }

    // ---------------------------------------------------------------- tailor
    @SuppressWarnings("unchecked")
    public AiResult tailor(JobMatchRequest req) {
        String resumeJson = toJson(req.resume());
        return cached("tailor", req.provider(), () -> {
            String user = prompts.render("tailor_resume", Map.of(
                    "resumeJson", resumeJson, "jobDescription", req.jobDescription().trim()));
            LlmResponse r = router.chat(LlmRequest.json(system(), user), req.provider());
            Map<String, Object> parsed = parseJson(r);
            Object resumePart = parsed.containsKey("resume") ? parsed.get("resume") : parsed;
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("resume", ResumeNormalizer.normalize((Map<String, Object>) resumePart));
            data.put("changes", parsed.getOrDefault("changes", List.of()));
            return new AiResult(data, meta(r));
        }, resumeJson, req.jobDescription());
    }

    // ---------------------------------------------------------------- ATS score
    public AiResult atsScore(JobMatchRequest req) {
        String resumeJson = toJson(req.resume());
        return cached("ats", req.provider(), () -> {
            AtsKeywordAnalyzer.Result kw = AtsKeywordAnalyzer.analyze(
                    req.jobDescription(), ResumeNormalizer.toPlainText(req.resume()), 25);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("keywordScore", kw.score());
            data.put("matchedKeywords", kw.matched());
            data.put("missingKeywords", kw.missing());

            Map<String, Object> meta;
            try {
                String user = prompts.render("ats_feedback", Map.of(
                        "resumeJson", resumeJson,
                        "jobDescription", req.jobDescription().trim(),
                        "missingKeywords", String.join(", ", kw.missing())));
                LlmResponse r = router.chat(LlmRequest.json(system(), user), req.provider());
                Map<String, Object> ai = parseJson(r);
                int aiScore = clamp(asInt(ai.get("overallScore"), kw.score()));
                // Hybrid score: 40% deterministic keyword coverage + 60% LLM judgement
                data.put("overallScore", Math.round(0.4f * kw.score() + 0.6f * aiScore));
                data.put("aiScore", aiScore);
                data.put("sectionScores", ai.getOrDefault("sectionScores", Map.of()));
                data.put("strengths", ai.getOrDefault("strengths", List.of()));
                data.put("improvements", ai.getOrDefault("improvements", List.of()));
                data.put("verdict", ai.getOrDefault("verdict", ""));
                data.put("aiFeedbackAvailable", true);
                meta = meta(r);
            } catch (LlmException e) {
                // Graceful degradation: keyword analysis still works without the LLM
                log.warn("ATS AI feedback unavailable, returning keyword-only score: {}", e.getMessage());
                data.put("overallScore", kw.score());
                data.put("aiFeedbackAvailable", false);
                meta = Map.of("provider", "keyword-only", "error", e.getMessage());
            }
            return new AiResult(data, meta);
        }, resumeJson, req.jobDescription());
    }

    // ---------------------------------------------------------------- interview prep
    public AiResult interviewPrep(JobMatchRequest req) {
        String resumeJson = toJson(req.resume());
        return cached("interview", req.provider(), () -> {
            String user = prompts.render("interview_prep", Map.of(
                    "resumeJson", resumeJson, "jobDescription", req.jobDescription().trim()));
            LlmResponse r = router.chat(LlmRequest.json(system(), user), req.provider());
            return new AiResult(parseJson(r), meta(r));
        }, resumeJson, req.jobDescription());
    }

    // ---------------------------------------------------------------- improve one field
    public AiResult improve(ImproveRequest req) {
        String user = prompts.render("improve_section", Map.of(
                "section", req.section(),
                "text", req.text().trim(),
                "targetRole", req.targetRole() == null || req.targetRole().isBlank() ? "not specified" : req.targetRole()));
        LlmResponse r = router.chat(new LlmRequest(system(), user, true, 0.5, 1500), req.provider());
        return new AiResult(parseJson(r), meta(r));
    }

    // ---------------------------------------------------------------- cover letter (streaming)
    public void streamCoverLetter(CoverLetterRequest req, Consumer<LlmProvider> onStart, Consumer<String> onToken) {
        String user = prompts.render("cover_letter", Map.of(
                "resumeJson", toJson(req.resume()),
                "jobDescription", req.jobDescription().trim(),
                "companyName", blankTo(req.companyName(), "the company"),
                "hiringManager", blankTo(req.hiringManager(), "Hiring Manager"),
                "tone", blankTo(req.tone(), "professional"),
                "today", LocalDate.now().toString()));
        router.stream(LlmRequest.text(system(), user, 0.6), req.provider(), onStart, onToken);
    }

    // ================================================================ helpers
    private String system() {
        return prompts.load("system_resume_expert");
    }

    /** Parse JSON; if the model produced broken JSON, ask it once to repair it. */
    private Map<String, Object> parseJson(LlmResponse r) {
        Map<String, Object> parsed = tryParse(r.content());
        if (parsed != null) return parsed;

        log.warn("Invalid JSON from {} - attempting self-repair", r.provider());
        String user = prompts.render("json_repair", Map.of("broken", JsonExtractor.stripReasoning(r.content())));
        LlmResponse fixed = router.chat(new LlmRequest(null, user, true, 0.0, null), r.provider());
        parsed = tryParse(fixed.content());
        if (parsed != null) return parsed;
        throw new LlmException("The AI returned an invalid response. Please try again.", r.provider(), 502, false);
    }

    private Map<String, Object> tryParse(String raw) {
        String json = JsonExtractor.extractObject(raw);
        if (json == null) return null;
        try {
            return mapper.readValue(json, MAP);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private AiResult cached(String op, String provider, java.util.function.Supplier<AiResult> work, String... inputs) {
        String[] parts = new String[inputs.length + 2];
        parts[0] = op;
        parts[1] = provider == null ? "" : provider;
        System.arraycopy(inputs, 0, parts, 2, inputs.length);
        String key = ResponseCache.key(parts);

        AiResult hit = cache.get(key);
        if (hit != null) {
            Map<String, Object> meta = new LinkedHashMap<>(hit.meta());
            meta.put("cached", true);
            return new AiResult(hit.data(), meta);
        }
        AiResult fresh = work.get();
        cache.put(key, fresh);
        return fresh;
    }

    private static Map<String, Object> meta(LlmResponse r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("provider", r.provider());
        m.put("model", r.model());
        m.put("latencyMs", r.latencyMs());
        m.put("promptTokens", r.promptTokens());
        m.put("completionTokens", r.completionTokens());
        m.put("cached", false);
        return m;
    }

    private String toJson(Object o) {
        try {
            return mapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid resume payload", e);
        }
    }

    private static int asInt(Object o, int dflt) {
        if (o instanceof Number n) return n.intValue();
        try { return Integer.parseInt(String.valueOf(o).replaceAll("[^0-9]", "")); } catch (Exception e) { return dflt; }
    }

    private static int clamp(int v) { return Math.max(0, Math.min(100, v)); }

    private static String blankTo(String s, String d) { return s == null || s.isBlank() ? d : s.trim(); }
}
