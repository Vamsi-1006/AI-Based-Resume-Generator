package com.resume.backend.exception;

import com.resume.backend.llm.LlmException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(LlmException.class)
    public ResponseEntity<ApiError> llm(LlmException e, HttpServletRequest req) {
        HttpStatus status = switch (e.getStatus()) {
            case 429 -> HttpStatus.TOO_MANY_REQUESTS;
            case 503 -> HttpStatus.SERVICE_UNAVAILABLE;
            default -> HttpStatus.BAD_GATEWAY;
        };
        log.error("LLM error: {}", e.getMessage());
        String msg = status == HttpStatus.TOO_MANY_REQUESTS
                ? "AI provider rate limit reached. Please wait a minute and try again."
                : e.getMessage();
        return build(status, msg, req, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException e, HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f -> fields.putIfAbsent(f.getField(), f.getDefaultMessage()));
        String first = fields.values().stream().findFirst().orElse("Invalid request");
        return build(HttpStatus.BAD_REQUEST, first, req, fields);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException e, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Malformed JSON request body", req, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> generic(Exception e, HttpServletRequest req) {
        log.error("Unhandled error", e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again.", req, null);
    }

    private ResponseEntity<ApiError> build(HttpStatus s, String msg, HttpServletRequest req, Map<String, String> fields) {
        return ResponseEntity.status(s)
                .body(new ApiError(Instant.now(), s.value(), s.getReasonPhrase(), msg, req.getRequestURI(), fields));
    }
}
