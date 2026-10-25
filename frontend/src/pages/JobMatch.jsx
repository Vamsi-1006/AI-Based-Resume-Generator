import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { FaBullseye, FaMagic, FaComments, FaCheckCircle, FaExclamationTriangle, FaSave } from "react-icons/fa";
import { atsScore, interviewPrep, tailorResume } from "../api/ResumeService";
import { errorMessage } from "../api/client";
import ResumePicker from "../components/ResumePicker";
import ProviderSelect from "../components/ProviderSelect";
import MetaBadge from "../components/MetaBadge";
import Resume from "../components/Resume";
import useProviders from "../hooks/useProviders";
import { getResume, saveResume } from "../utils/storage";

const TABS = [
  { key: "ats", label: "ATS Score", icon: <FaBullseye />, action: atsScore, cta: "Analyse match" },
  { key: "tailor", label: "Tailor Resume", icon: <FaMagic />, action: tailorResume, cta: "Tailor my resume" },
  { key: "interview", label: "Interview Prep", icon: <FaComments />, action: interviewPrep, cta: "Generate questions" },
];

const scoreColor = (s) => (s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-error");
const pretty = (k) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

function AtsResult({ result }) {
  const d = result.data;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-10">
        <div className="text-center">
          <div className={`radial-progress ${scoreColor(d.overallScore)}`} style={{ "--value": d.overallScore, "--size": "9rem", "--thickness": "10px" }} role="progressbar">
            <span className="text-3xl font-bold">{d.overallScore}</span>
          </div>
          <p className="mt-2 font-semibold">Overall match</p>
        </div>
        <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-100">
          <div className="stat">
            <div className="stat-title">Keyword coverage</div>
            <div className={`stat-value ${scoreColor(d.keywordScore)}`}>{d.keywordScore}%</div>
            <div className="stat-desc">{d.matchedKeywords.length} of {d.matchedKeywords.length + d.missingKeywords.length} keywords</div>
          </div>
          {d.aiFeedbackAvailable && (
            <div className="stat">
              <div className="stat-title">AI recruiter score</div>
              <div className={`stat-value ${scoreColor(d.aiScore)}`}>{d.aiScore}</div>
              <div className="stat-desc">overall = 40% keywords + 60% AI</div>
            </div>
          )}
        </div>
      </div>

      {d.verdict && <p className="text-center italic opacity-80">“{d.verdict}”</p>}
      {!d.aiFeedbackAvailable && (
        <div className="alert alert-warning">AI feedback is unavailable right now - showing keyword analysis only.</div>
      )}

      {d.sectionScores && Object.keys(d.sectionScores).length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(d.sectionScores).map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-sm"><span>{pretty(k)}</span><span>{v}</span></div>
              <progress className={`progress w-full ${v >= 75 ? "progress-success" : v >= 50 ? "progress-warning" : "progress-error"}`} value={v} max="100" />
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-success text-base"><FaCheckCircle /> Matched keywords</h3>
            <div className="flex flex-wrap gap-2">
              {d.matchedKeywords.length ? d.matchedKeywords.map((k) => <span key={k} className="badge badge-success badge-outline">{k}</span>) : <span className="opacity-60">None</span>}
            </div>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-error text-base"><FaExclamationTriangle /> Missing keywords</h3>
            <div className="flex flex-wrap gap-2">
              {d.missingKeywords.length ? d.missingKeywords.map((k) => <span key={k} className="badge badge-error badge-outline">{k}</span>) : <span className="opacity-60">None - great coverage!</span>}
            </div>
            <p className="text-xs opacity-60 mt-2">Only add keywords for skills you actually have.</p>
          </div>
        </div>
      </div>

      {(d.strengths?.length > 0 || d.improvements?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Strengths</h3>
            <ul className="space-y-1">{d.strengths?.map((s, i) => <li key={i} className="flex gap-2"><span className="text-success">✓</span>{s}</li>)}</ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Improvements</h3>
            <ul className="space-y-1">{d.improvements?.map((s, i) => <li key={i} className="flex gap-2"><span className="text-warning">→</span>{s}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}

function TailorResult({ result, sourceName }) {
  const navigate = useNavigate();
  const [template, setTemplate] = useState("modern");
  const { resume, changes } = result.data;

  const saveAndEdit = () => {
    const id = saveResume({ name: `${sourceName} - tailored`, data: resume, template });
    toast.success("Tailored resume saved");
    navigate(`/generate-resume?id=${id}`);
  };

  return (
    <div className="space-y-6">
      {changes?.length > 0 && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-base">What changed</h3>
            <ul className="list-disc pl-5 space-y-1">{changes.map((c, i) => <li key={i}>{typeof c === "string" ? c : JSON.stringify(c)}</li>)}</ul>
          </div>
        </div>
      )}
      <Resume data={resume} template={template} onTemplateChange={setTemplate}>
        <button className="btn btn-primary" onClick={saveAndEdit}><FaSave /> Save as new resume & edit</button>
      </Resume>
    </div>
  );
}

function InterviewResult({ result }) {
  const { questions = [], skillGaps = [] } = result.data;
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="collapse collapse-plus bg-base-100 border border-base-300">
          <input type="checkbox" defaultChecked={i === 0} />
          <div className="collapse-title font-medium flex gap-3 items-start">
            <span className="badge badge-primary badge-outline shrink-0">{q.category}</span>
            <span>{q.question}</span>
          </div>
          <div className="collapse-content space-y-2 text-sm">
            {q.whyAsked && <p><span className="font-semibold">Why they ask: </span>{q.whyAsked}</p>}
            {q.answerTips && <p><span className="font-semibold">How to answer: </span>{q.answerTips}</p>}
          </div>
        </div>
      ))}
      {skillGaps.length > 0 && (
        <div className="alert alert-info flex-col items-start">
          <h3 className="font-semibold">Skill gaps to prepare</h3>
          <ul className="list-disc pl-5">{skillGaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function JobMatch() {
  const [searchParams] = useSearchParams();
  const { providers, provider, setProvider, backendUp } = useProviders();
  const [selected, setSelected] = useState(() => {
    const r = searchParams.get("id") && getResume(searchParams.get("id"));
    return r ? { id: r.id, name: r.name, data: r.data } : null;
  });
  const [jd, setJd] = useState("");
  const [tab, setTab] = useState("ats");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const current = TABS.find((t) => t.key === tab);

  const run = async () => {
    if (!selected) return toast.error("Select a resume first");
    if (jd.trim().length < 50) return toast.error("Paste the full job description (at least 50 characters)");
    try {
      setLoading(true);
      const res = await current.action(selected.data, jd, provider);
      setResults((r) => ({ ...r, [tab]: res }));
    } catch (e) {
      toast.error(errorMessage(e), { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const result = results[tab];

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Job Match</h1>
      <p className="text-center opacity-70 mb-8">Score your resume against a job, tailor it, and prepare for the interview.</p>

      <div className="grid md:grid-cols-2 gap-4 bg-base-200 p-6 rounded-box">
        <div className="space-y-3">
          <ResumePicker value={selected} onChange={(r) => { setSelected(r); setResults({}); }} />
          <ProviderSelect providers={providers} value={provider} onChange={setProvider} backendUp={backendUp} />
        </div>
        <label className="form-control">
          <div className="label">
            <span className="label-text font-semibold">Job description</span>
            <span className="label-text-alt">{jd.length} chars</span>
          </div>
          <textarea
            className="textarea textarea-bordered h-48"
            placeholder="Paste the full job description here…"
            value={jd}
            onChange={(e) => { setJd(e.target.value); setResults({}); }}
          />
        </label>
      </div>

      <div role="tablist" className="tabs tabs-boxed mt-6 justify-center">
        {TABS.map((t) => (
          <button key={t.key} role="tab" className={`tab gap-2 ${tab === t.key ? "tab-active" : ""}`} onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center my-6">
        <button className="btn btn-primary btn-wide" onClick={run} disabled={loading || !backendUp}>
          {loading ? <span className="loading loading-spinner" /> : current.icon} {loading ? "Working…" : current.cta}
        </button>
      </div>

      {result && (
        <div className="bg-base-200 rounded-box p-6 space-y-4">
          <MetaBadge meta={result.meta} />
          {tab === "ats" && <AtsResult result={result} />}
          {tab === "tailor" && <TailorResult result={result} sourceName={selected?.name || "Resume"} />}
          {tab === "interview" && <InterviewResult result={result} />}
        </div>
      )}
    </div>
  );
}

export default JobMatch;
