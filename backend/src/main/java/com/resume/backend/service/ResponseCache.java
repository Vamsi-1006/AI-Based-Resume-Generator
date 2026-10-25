package com.resume.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Supplier;

/** Small in-memory LRU + TTL cache: identical prompts don't burn free-tier quota twice. */
@Component
public class ResponseCache {

    private record CacheEntry(Object value, long expiresAt) { }

    private final long ttlMs;
    private final Map<String, CacheEntry> store;

    public ResponseCache(@Value("${app.cache.ttl-minutes:30}") long ttlMinutes,
                         @Value("${app.cache.max-entries:200}") int maxEntries) {
        this.ttlMs = ttlMinutes * 60_000;
        this.store = new LinkedHashMap<>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, CacheEntry> eldest) {
                return size() > maxEntries;
            }
        };
    }

    @SuppressWarnings("unchecked")
    public synchronized <T> T get(String key) {
        CacheEntry e = store.get(key);
        if (e == null) return null;
        if (e.expiresAt < System.currentTimeMillis()) { store.remove(key); return null; }
        return (T) e.value;
    }

    public synchronized void put(String key, Object value) {
        store.put(key, new CacheEntry(value, System.currentTimeMillis() + ttlMs));
    }

    public <T> T getOrCompute(String key, Supplier<T> supplier) {
        T hit = get(key);
        if (hit != null) return hit;
        T v = supplier.get();
        put(key, v);
        return v;
    }

    public static String key(String... parts) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            for (String p : parts) {
                md.update((p == null ? "" : p).getBytes(StandardCharsets.UTF_8));
                md.update((byte) 0);
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
