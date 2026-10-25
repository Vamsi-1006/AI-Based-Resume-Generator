# AI Resume Maker v2

Full-stack AI resume platform: **React + Vite + Tailwind/daisyUI** frontend and a **Spring Boot 3 (Java 17)** backend with a **provider-agnostic LLM layer** (Groq, Gemini, OpenAI, xAI Grok, Anthropic Claude, OpenRouter, Ollama), automatic fallback, structured JSON output with self-repair, response caching, rate limiting and SSE streaming.

```
ai-resume/
├── backend/   Spring Boot API  (port 8080)
└── frontend/  React app        (port 5173, proxies /api -> 8080)
```

---

## 1. Run it locally (≈5 minutes)

### Prerequisites
- Java 17+, Maven 3.9+ (or open `backend/` in IntelliJ and run `ResumeBackendApplication`)
- Node 18+
- A free **Groq API key** → https://console.groq.com/keys (no credit card)

### Backend
```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
# edit .env and set GROQ_API_KEY=gsk_...
mvn spring-boot:run
```
Check it: http://localhost:8080/api/v1/llm/providers → `groq` should show `"configured": true`.

> If you had `mvnw` / `.mvn/` in your old backend folder, copy them in and use `./mvnw spring-boot:run`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Quick API test
```bash
curl -X POST http://localhost:8080/api/v1/resume/generate \
  -H "Content-Type: application/json" \
  -d '{"userDescription":"I am Asha, a Java developer in Hyderabad with 3 years at Infosys building Spring Boot microservices on AWS. B.Tech CSE 2022."}'
```

---

## 2. Switching / adding LLMs

Everything lives in `backend/src/main/resources/application.yml` under `llm.providers`.

| Want to… | Do this |
|---|---|
| Use Groq (default, free) | set `GROQ_API_KEY` |
| Use Gemini free tier | set `GEMINI_API_KEY` |
| Use xAI Grok | set `XAI_API_KEY` (+ `XAI_MODEL` from console.x.ai) |
| Change default model | `LLM_PROVIDER=gemini` |
| Change fallback order | `LLM_FALLBACK=groq,gemini,openrouter` |
| Add **any** OpenAI-compatible API (Mistral, Together, DeepSeek, LM Studio, vLLM…) | add a new block with `type: openai`, `base-url`, `api-key`, `model` - **no code change** |
| Add a non-OpenAI API | implement `LlmProvider` and add one `case` in `LlmRouter.create()` (see `AnthropicProvider`) |

Notes
- `extra-params` passes provider-specific fields (e.g. `reasoning_effort: low` for GPT-OSS on Groq). Remove it if you switch Groq to a model that doesn't support it.
- Free-tier models change often - check the provider console and override with `GROQ_MODEL`, `GEMINI_MODEL`, etc.

---

## 3. Features

| Area | Feature |
|---|---|
| Generate | Free-text description → structured resume JSON (10 sections) |
| Edit | Full form editor, reorder items, skill levels, autosave draft, **Improve with AI** per field |
| Preview | 3 templates (Modern / Classic ATS / Minimal), Print (text PDF), multi-page image PDF, JSON export |
| Job Match | **Hybrid ATS score** (deterministic keyword coverage 40% + LLM recruiter score 60%), matched/missing keywords, section scores |
| Tailor | Rewrites the resume for a JD without inventing facts, lists every change, save as new version |
| Interview Prep | 8 role-specific questions with answer tips grounded in the resume + skill gaps |
| Cover Letter | Token-by-token **streaming (SSE)**, tone selection, stop button, copy/download |
| Library | My Resumes: save, rename, duplicate, import/export JSON (localStorage) |
| Site | Landing, About, Services, Contact (validated form → API), Privacy, Terms, 404, 6 themes |

---

## 4. API

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/v1/resume/generate` | `{ userDescription, provider? }` |
| POST | `/api/v1/resume/ats-score` | `{ resume, jobDescription, provider? }` |
| POST | `/api/v1/resume/tailor` | `{ resume, jobDescription, provider? }` |
| POST | `/api/v1/resume/interview-prep` | `{ resume, jobDescription, provider? }` |
| POST | `/api/v1/resume/improve` | `{ section, text, targetRole?, provider? }` |
| POST | `/api/v1/resume/cover-letter/stream` | `{ resume, jobDescription, companyName?, hiringManager?, tone?, provider? }` → `text/event-stream` |
| GET | `/api/v1/llm/providers` | - |
| POST | `/api/v1/contact` | `{ name, email, subject?, message }` |
| GET | `/actuator/health` | - |

All AI responses use one envelope: `{ "data": {...}, "meta": { provider, model, latencyMs, promptTokens, completionTokens, cached } }`.
Errors use: `{ status, error, message, path, fieldErrors }`.

---

## 5. Architecture

```
React (Vite) ──/api──▶ Spring Boot
                        ├─ RateLimitInterceptor   (per-IP, protects free quota)
                        ├─ ResumeController       (REST + SSE)
                        ├─ ResumeAiService        (use-cases)
                        │   ├─ PromptTemplateService  (classpath:prompts/*.txt, {{vars}})
                        │   ├─ ResponseCache          (SHA-256 key, LRU + TTL)
                        │   ├─ JsonExtractor + self-repair prompt
                        │   ├─ ResumeNormalizer       (schema guarantee)
                        │   └─ AtsKeywordAnalyzer     (deterministic scoring)
                        └─ LlmRouter  (fallback chain, retries, 429 → next provider)
                             ├─ OpenAiCompatibleProvider  (Groq, Gemini, OpenAI, xAI, OpenRouter, Ollama)
                             └─ AnthropicProvider
```

Design choices worth explaining in interviews
1. **Strategy + Factory** for providers - business logic never knows which LLM answered.
2. **Fallback chain** - 5xx/timeouts retry with backoff; 429 skips straight to the next provider; streaming falls back only if no token was sent yet.
3. **Structured output reliability** - JSON mode → brace-balanced extraction (handles `<think>` tags and code fences) → one LLM self-repair pass → normaliser that fixes field aliases/types.
4. **Hallucination control** - system prompt forbids invented facts; unknown metrics become `[X%]` placeholders.
5. **Prompt-injection guard** - user text is wrapped in `<user_input>` / `<job_description>` tags and treated as data.
6. **Hybrid ATS scoring** - explainable keyword coverage plus LLM judgement; degrades gracefully to keyword-only if the LLM is down.
7. **Cost control** - cache identical requests, per-IP rate limiting, `reasoning_effort: low`, token usage logged per call.
8. **Prompts as files** - versionable and editable without touching Java.

---

## 6. Ideas for v3 (good “next steps” to talk about)
- Upload an existing PDF/DOCX resume and parse it (Apache PDFBox / Tika) into the same JSON schema
- JWT auth + PostgreSQL to sync resumes across devices
- Embeddings + vector search to match one resume against many saved jobs
- Function/tool calling, e.g. the model calls a `searchSkills` tool to standardise skill names
- Langfuse/OpenTelemetry tracing for prompt versions, latency and cost
- Docker Compose + GitHub Actions CI, deploy frontend to Vercel and backend to Render/Azure
