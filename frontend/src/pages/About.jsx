import React from "react";
import { Link } from "react-router";
import { FaLightbulb, FaUserShield, FaBalanceScale, FaRocket } from "react-icons/fa";

const VALUES = [
  { icon: <FaBalanceScale />, title: "Truthful by design", text: "Prompts forbid the AI from inventing employers, dates, degrees or numbers. Unknown metrics become [X%] placeholders for you to fill in." },
  { icon: <FaUserShield />, title: "Private", text: "No account and no database of resumes. Everything you save stays in your browser's local storage." },
  { icon: <FaLightbulb />, title: "Explainable scores", text: "ATS scoring combines a transparent keyword match with AI feedback, so you can see exactly why you scored what you did." },
  { icon: <FaRocket />, title: "Model-agnostic", text: "Runs on Groq, Gemini, OpenAI, xAI Grok, Claude, OpenRouter or a local Ollama model, with automatic fallback." },
];

const STACK = ["React 18", "Vite", "Tailwind + daisyUI", "React Hook Form", "Spring Boot 3", "Java 17", "Server-Sent Events", "LLM APIs (OpenAI-compatible + Anthropic)"];

function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About AI Resume Maker</h1>
        <p className="text-lg opacity-80">
          Writing a resume is hard, and tailoring it for every application is harder. We built AI Resume Maker so anyone
          can turn a plain description of their experience into a clean, ATS-friendly resume - and then adapt it to each
          job in minutes, not hours.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {VALUES.map((v) => (
          <div key={v.title} className="card bg-base-200">
            <div className="card-body">
              <div className="text-3xl text-primary">{v.icon}</div>
              <h3 className="card-title">{v.title}</h3>
              <p className="opacity-80">{v.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-base-200 rounded-box p-8">
        <h2 className="text-2xl font-bold mb-4">How it works under the hood</h2>
        <ol className="list-decimal pl-6 space-y-2 opacity-90">
          <li>Your description is inserted into a versioned prompt template that defines a strict JSON schema.</li>
          <li>The backend routes the request to the selected LLM. If it fails or is rate-limited, it falls back to the next configured provider.</li>
          <li>The response is parsed, auto-repaired if the JSON is malformed, and normalised so the editor always gets a valid resume.</li>
          <li>Identical requests are cached, and per-IP rate limiting protects the free-tier quota.</li>
        </ol>
        <div className="flex flex-wrap gap-2 mt-6">
          {STACK.map((s) => <span key={s} className="badge badge-outline">{s}</span>)}
        </div>
      </section>

      <section className="text-center">
        <Link to="/generate-resume" className="btn btn-primary btn-lg">Try it now</Link>
      </section>
    </div>
  );
}

export default About;
