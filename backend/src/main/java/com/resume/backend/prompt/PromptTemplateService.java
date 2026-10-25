package com.resume.backend.prompt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Loads versionable prompt templates from classpath:prompts/*.txt and fills {{placeholders}}.
 * Uses getInputStream() (not getFile()) so it also works inside a packaged JAR.
 */
@Service
public class PromptTemplateService {

    private static final Logger log = LoggerFactory.getLogger(PromptTemplateService.class);
    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*}}");

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String render(String templateName, Map<String, ?> values) {
        String template = load(templateName);
        Matcher m = PLACEHOLDER.matcher(template);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            Object v = values.get(m.group(1));
            if (v == null) log.warn("Prompt '{}' has no value for {{{}}}", templateName, m.group(1));
            m.appendReplacement(sb, Matcher.quoteReplacement(v == null ? "" : v.toString()));
        }
        m.appendTail(sb);
        return sb.toString();
    }

    public String load(String templateName) {
        return cache.computeIfAbsent(templateName, name -> {
            try (InputStream in = new ClassPathResource("prompts/" + name + ".txt").getInputStream()) {
                return new String(in.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new UncheckedIOException("Prompt template not found: " + name, e);
            }
        });
    }
}
