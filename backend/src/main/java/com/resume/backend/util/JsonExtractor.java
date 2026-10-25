package com.resume.backend.util;

/**
 * Pulls the first complete JSON object out of raw LLM output.
 * Handles reasoning tags (&lt;think&gt;), markdown code fences and leading/trailing chatter.
 */
public final class JsonExtractor {

    private JsonExtractor() { }

    public static String stripReasoning(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    /** @return the JSON object text, or null if none is found. */
    public static String extractObject(String raw) {
        String s = stripReasoning(raw);
        int start = s.indexOf('{');
        if (start < 0) return null;

        int depth = 0;
        boolean inString = false;
        boolean escaped = false;
        for (int i = start; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inString) {
                if (escaped) escaped = false;
                else if (c == '\\') escaped = true;
                else if (c == '"') inString = false;
                continue;
            }
            if (c == '"') inString = true;
            else if (c == '{') depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) return s.substring(start, i + 1);
            }
        }
        return null; // truncated / unbalanced
    }
}
