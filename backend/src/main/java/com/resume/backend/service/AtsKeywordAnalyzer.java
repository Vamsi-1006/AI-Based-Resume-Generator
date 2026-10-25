package com.resume.backend.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic (non-LLM) ATS keyword match. Cheap, explainable and stable -
 * combined with LLM feedback to produce the final score.
 */
public final class AtsKeywordAnalyzer {

    public record Result(int score, List<String> matched, List<String> missing) { }

    /** Common multi-word skills that must be matched as a phrase. */
    private static final List<String> PHRASES = List.of(
            "spring boot", "spring security", "spring cloud", "machine learning", "deep learning",
            "data structures", "system design", "rest api", "restful api", "ci/cd", "unit testing",
            "integration testing", "test driven development", "object oriented", "design patterns",
            "node.js", "next.js", "react native", "vue.js", "power bi", "google cloud", "microsoft azure",
            "amazon web services", "aws lambda", "github actions", "large language models", "prompt engineering",
            "natural language processing", "computer vision", "data analysis", "project management",
            "agile", "scrum", "micro services", "microservices", "event driven", "distributed systems",
            "sql server", "no sql", "nosql", "problem solving", "stakeholder management", "generative ai",
            "vector database", "retrieval augmented generation");

    private static final Set<String> STOP = Set.of(
            "a", "an", "and", "the", "or", "of", "to", "in", "for", "on", "with", "at", "by", "from", "as", "is",
            "are", "be", "will", "you", "your", "we", "our", "us", "they", "their", "this", "that", "these", "those",
            "it", "its", "who", "what", "which", "can", "able", "ability", "must", "should", "would", "have", "has",
            "had", "not", "but", "if", "all", "any", "more", "most", "other", "such", "into", "about", "over",
            "experience", "experienced", "years", "year", "work", "working", "team", "teams", "strong", "good",
            "excellent", "skills", "skill", "knowledge", "role", "job", "candidate", "company", "including",
            "plus", "preferred", "required", "requirements", "responsibilities", "responsible", "using", "use",
            "new", "well", "within", "across", "help", "join", "looking", "opportunity", "etc", "also", "per",
            "understanding", "level", "least", "minimum", "bonus", "nice", "high", "highly", "based", "related",
            "degree", "field", "equivalent", "environment", "best", "practices", "build", "building", "develop",
            "developing", "design", "designing", "ensure", "support", "provide", "make", "drive", "deliver",
            "solutions", "solution", "products", "product", "business", "customers", "customer", "world", "time",
            "people", "need", "needs", "seeking", "ideal", "developer", "engineer", "great", "passion", "passionate", "want", "like", "self", "fast", "paced", "hands", "day");

    private static final Pattern TOKEN = Pattern.compile("[a-z][a-z0-9+#./-]*[a-z0-9+#]|[a-z]");

    private AtsKeywordAnalyzer() { }

    public static Result analyze(String jobDescription, String resumeText, int maxKeywords) {
        String jd = normalize(jobDescription);
        String resume = normalize(resumeText);

        Map<String, Integer> freq = new LinkedHashMap<>();
        String jdRemaining = jd;
        for (String phrase : PHRASES) {
            int count = countOccurrences(jd, phrase);
            if (count > 0) {
                freq.merge(phrase, count + 2, Integer::sum);   // phrases get a boost
                jdRemaining = jdRemaining.replace(phrase, " ");
            }
        }
        Matcher m = TOKEN.matcher(jdRemaining);
        while (m.find()) {
            String t = m.group().replaceAll("[./-]+$", "");
            if (t.length() < 2 || STOP.contains(t) || t.chars().allMatch(Character::isDigit)) continue;
            freq.merge(t, 1, Integer::sum);
        }

        List<String> keywords = freq.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(maxKeywords)
                .map(Map.Entry::getKey)
                .toList();

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (String k : keywords) {
            if (containsWord(resume, k)) matched.add(k); else missing.add(k);
        }
        int score = keywords.isEmpty() ? 0 : Math.round(100f * matched.size() / keywords.size());
        return new Result(score, matched, missing);
    }

    private static String normalize(String s) {
        return s == null ? "" : " " + s.toLowerCase(Locale.ROOT).replaceAll("[\\s,;:()\\[\\]{}\"'|]+", " ") + " ";
    }

    private static int countOccurrences(String text, String phrase) {
        int count = 0, idx = 0;
        while ((idx = text.indexOf(" " + phrase, idx)) >= 0) { count++; idx += phrase.length(); }
        return count;
    }

    private static boolean containsWord(String text, String word) {
        Pattern p = Pattern.compile("(?<![a-z0-9])" + Pattern.quote(word) + "(?![a-z0-9+#])");
        return p.matcher(text).find();
    }
}
