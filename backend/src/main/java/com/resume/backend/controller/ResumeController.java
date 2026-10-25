package com.resume.backend.controller;

import com.resume.backend.dto.AiResult;
import com.resume.backend.dto.CoverLetterRequest;
import com.resume.backend.dto.ImproveRequest;
import com.resume.backend.dto.JobMatchRequest;
import com.resume.backend.dto.ResumeRequest;
import com.resume.backend.llm.LlmException;
import com.resume.backend.service.ResumeAiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ExecutorService;

@RestController
@RequestMapping("/api/v1/resume")
public class ResumeController {

    private static final Logger log = LoggerFactory.getLogger(ResumeController.class);

    private final ResumeAiService ai;
    private final ExecutorService streamingExecutor;

    public ResumeController(ResumeAiService ai, ExecutorService streamingExecutor) {
        this.ai = ai;
        this.streamingExecutor = streamingExecutor;
    }

    /** Free-text description -> structured resume JSON. */
    @PostMapping("/generate")
    public ResponseEntity<AiResult> generate(@Valid @RequestBody ResumeRequest req) {
        return ResponseEntity.ok(ai.generate(req.userDescription(), req.provider()));
    }

    /** Hybrid ATS score (keyword match + LLM review) against a job description. */
    @PostMapping("/ats-score")
    public ResponseEntity<AiResult> atsScore(@Valid @RequestBody JobMatchRequest req) {
        return ResponseEntity.ok(ai.atsScore(req));
    }

    /** Rewrites the resume to target a job description (without inventing facts). */
    @PostMapping("/tailor")
    public ResponseEntity<AiResult> tailor(@Valid @RequestBody JobMatchRequest req) {
        return ResponseEntity.ok(ai.tailor(req));
    }

    /** Likely interview questions + answer pointers grounded in the resume. */
    @PostMapping("/interview-prep")
    public ResponseEntity<AiResult> interviewPrep(@Valid @RequestBody JobMatchRequest req) {
        return ResponseEntity.ok(ai.interviewPrep(req));
    }

    /** Improve a single field (summary, bullet points, project description...). */
    @PostMapping("/improve")
    public ResponseEntity<AiResult> improve(@Valid @RequestBody ImproveRequest req) {
        return ResponseEntity.ok(ai.improve(req));
    }

    /**
     * Streams a cover letter token-by-token using Server-Sent Events.
     * Events: meta {provider, model} -> token {t} ... -> done | error {message}
     */
    @PostMapping(value = "/cover-letter/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter coverLetter(@Valid @RequestBody CoverLetterRequest req) {
        SseEmitter emitter = new SseEmitter(180_000L);
        streamingExecutor.submit(() -> {
            try {
                ai.streamCoverLetter(req,
                        p -> send(emitter, "meta", Map.of("provider", p.id(), "model", p.model())),
                        token -> send(emitter, "token", Map.of("t", token)));
                send(emitter, "done", Map.of("ok", true));
                emitter.complete();
            } catch (LlmException e) {
                send(emitter, "error", Map.of("message", e.getMessage()));
                emitter.complete();
            } catch (Exception e) {
                log.error("Cover letter stream failed", e);
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }

    private static void send(SseEmitter emitter, String event, Object data) {
        try {
            emitter.send(SseEmitter.event().name(event).data(data, MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            // client disconnected (e.g. pressed Stop) - abort generation
            throw new IllegalStateException("Client disconnected", e);
        }
    }
}


//@GetMapping("/get/user")
//public String getUser(@RequestParam String userId) {
//    if (userId.equals("Vamsi")) {
//        return "Matched";
//    } else {
//        return "Not Matched";
//    }
//}
//
//@GetMapping("/get/user/{id}")
//public String getUserPath(@PathVariable String id) {
//    if (id.equals("Vamsi")) {
//        return "Matched";
//    } else {
//        return "Not Matched";
//    }
//}

