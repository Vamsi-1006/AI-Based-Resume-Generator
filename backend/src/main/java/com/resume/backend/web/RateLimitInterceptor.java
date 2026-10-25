package com.resume.backend.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window per-IP rate limiter for AI endpoints - protects the free-tier LLM quota.
 * Implemented as an MVC interceptor so CORS headers are still applied to 429 responses.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final long WINDOW_MS = 60_000;

    private record Window(long start, int count) { }

    private final int limit;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitInterceptor(@Value("${app.rate-limit.requests-per-minute:20}") int limit) {
        this.limit = limit;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws IOException {
        if (!"POST".equalsIgnoreCase(req.getMethod())) return true;

        long now = System.currentTimeMillis();
        Window w = windows.compute(clientIp(req), (k, old) ->
                old == null || now - old.start() >= WINDOW_MS ? new Window(now, 1) : new Window(old.start(), old.count() + 1));

        res.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - w.count())));
        if (w.count() > limit) {
            long retryAfter = Math.max(1, (WINDOW_MS - (now - w.start())) / 1000);
            res.setStatus(429);
            res.setHeader("Retry-After", String.valueOf(retryAfter));
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests. Try again in "
                    + retryAfter + "s.\",\"path\":\"" + req.getRequestURI() + "\"}");
            return false;
        }
        if (windows.size() > 10_000) windows.entrySet().removeIf(e -> now - e.getValue().start() > WINDOW_MS);
        return true;
    }

    private static String clientIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null && !fwd.isBlank() ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }
}
