package com.resume.backend.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Guarantees the resume JSON always matches the shape the UI expects,
 * no matter how loosely a (small) model followed the schema.
 */
public final class ResumeNormalizer {

    /** section -> ordered field names; first field is the "primary" one. */
    static final Map<String, List<String>> SECTIONS = new LinkedHashMap<>();
    static {
        SECTIONS.put("skills", List.of("title", "level"));
        SECTIONS.put("experience", List.of("jobTitle", "company", "location", "duration", "responsibility"));
        SECTIONS.put("education", List.of("degree", "university", "location", "graduationYear"));
        SECTIONS.put("certifications", List.of("title", "issuingOrganization", "year"));
        SECTIONS.put("projects", List.of("title", "description", "technologiesUsed", "githubLink"));
        SECTIONS.put("achievements", List.of("title", "year", "extraInformation"));
        SECTIONS.put("languages", List.of("name"));
        SECTIONS.put("interests", List.of("name"));
    }

    private static final List<String> PERSONAL = List.of(
            "fullName", "email", "phoneNumber", "location", "linkedIn", "gitHub", "portfolio");

    private static final Map<String, String> ALIASES = Map.of(
            "linkedin", "linkedIn", "github", "gitHub", "phone", "phoneNumber",
            "name", "fullName", "website", "portfolio", "responsibilities", "responsibility",
            "technologies", "technologiesUsed", "institution", "university");

    private ResumeNormalizer() { }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> normalize(Map<String, Object> raw) {
        Map<String, Object> in = raw == null ? Map.of() : raw;
        // some models wrap the payload: {"resume": {...}}
        if (in.size() == 1 && in.get("resume") instanceof Map<?, ?> inner) in = (Map<String, Object>) inner;

        Map<String, Object> out = new LinkedHashMap<>();

        Map<String, Object> pi = new LinkedHashMap<>();
        Object piRaw = in.get("personalInformation");
        Map<String, Object> src = piRaw instanceof Map<?, ?> m ? aliased((Map<String, Object>) m) : Map.of();
        for (String k : PERSONAL) pi.put(k, str(src.get(k)));
        out.put("personalInformation", pi);

        out.put("summary", str(in.get("summary")));

        for (Map.Entry<String, List<String>> sec : SECTIONS.entrySet()) {
            List<Map<String, Object>> items = new ArrayList<>();
            Object val = in.get(sec.getKey());
            if (val instanceof Collection<?> list) {
                for (Object item : list) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    if (item instanceof Map<?, ?> im) {
                        Map<String, Object> a = aliased((Map<String, Object>) im);
                        for (String f : sec.getValue()) row.put(f, str(a.get(f)));
                    } else if (item != null) {
                        for (String f : sec.getValue()) row.put(f, "");
                        row.put(sec.getValue().get(0), str(item));
                    }
                    if (row.values().stream().anyMatch(v -> !String.valueOf(v).isBlank())) items.add(row);
                }
            }
            out.put(sec.getKey(), items);
        }
        return out;
    }

    private static Map<String, Object> aliased(Map<String, Object> m) {
        Map<String, Object> r = new LinkedHashMap<>(m);
        ALIASES.forEach((alias, canonical) -> {
            if (!r.containsKey(canonical) && r.containsKey(alias)) r.put(canonical, r.get(alias));
        });
        return r;
    }

    /** Lists become comma/newline text so every form field is a plain string. */
    static String str(Object v) {
        if (v == null) return "";
        if (v instanceof Collection<?> c) {
            boolean longItems = c.stream().anyMatch(x -> String.valueOf(x).length() > 40);
            return c.stream().map(String::valueOf).map(String::trim)
                    .map(s -> longItems ? "- " + s.replaceFirst("^[-*\u2022]\\s*", "") : s)
                    .collect(Collectors.joining(longItems ? "\n" : ", "));
        }
        return String.valueOf(v).trim();
    }

    /** Flattens every text value - used for keyword matching. */
    public static String toPlainText(Object node) {
        StringBuilder sb = new StringBuilder();
        flatten(node, sb);
        return sb.toString();
    }

    private static void flatten(Object node, StringBuilder sb) {
        if (node instanceof Map<?, ?> m) m.values().forEach(v -> flatten(v, sb));
        else if (node instanceof Collection<?> c) c.forEach(v -> flatten(v, sb));
        else if (node != null) sb.append(node).append(' ');
    }
}
