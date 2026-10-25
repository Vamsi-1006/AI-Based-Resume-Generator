package com.resume.backend.controller;

import com.resume.backend.llm.LlmRouter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/llm")
public class LlmController {

    private final LlmRouter router;

    public LlmController(LlmRouter router) {
        this.router = router;
    }

    /** Lists providers (never exposes keys) so the UI can offer a model picker. */
    @GetMapping("/providers")
    public List<Map<String, Object>> providers() {
        return router.describe();
    }
}
