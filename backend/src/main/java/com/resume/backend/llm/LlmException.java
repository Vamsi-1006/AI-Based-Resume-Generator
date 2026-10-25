package com.resume.backend.llm;

/** Unified error for every provider so callers never deal with HTTP details. */
public class LlmException extends RuntimeException {

    private final String provider;
    private final int status;        // upstream HTTP status, 0 if not HTTP
    private final boolean retryable;

    public LlmException(String message, String provider, int status, boolean retryable, Throwable cause) {
        super(message, cause);
        this.provider = provider;
        this.status = status;
        this.retryable = retryable;
    }

    public LlmException(String message, String provider, int status, boolean retryable) {
        this(message, provider, status, retryable, null);
    }

    public static LlmException fromHttp(String provider, int status, String body) {
        boolean retryable = status == 408 || status == 429 || status >= 500;
        String snippet = body == null ? "" : body.substring(0, Math.min(400, body.length()));
        return new LlmException("Provider '" + provider + "' returned HTTP " + status + ": " + snippet,
                provider, status, retryable);
    }

    public String getProvider() { return provider; }
    public int getStatus() { return status; }
    public boolean isRetryable() { return retryable; }
    public boolean isRateLimited() { return status == 429; }
}
