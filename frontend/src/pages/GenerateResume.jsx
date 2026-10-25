import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { FaBrain, FaTrash, FaPaperPlane, FaFileImport, FaPen, FaSave, FaBullseye, FaRedo, FaEdit, FaHistory } from "react-icons/fa";
import { generateResume } from "../api/ResumeService";
import { errorMessage } from "../api/client";
import Resume from "../components/Resume";
import ResumeForm from "../components/ResumeForm";
import ProviderSelect from "../components/ProviderSelect";
import MetaBadge from "../components/MetaBadge";
import useProviders from "../hooks/useProviders";
import { emptyResume, normalizeResume } from "../utils/resumeSchema";
import { getResume, loadDraft, readJsonFile, saveDraft, saveResume } from "../utils/storage";
import { SAMPLE_PROMPTS } from "../utils/samples";

const MIN_CHARS = 30;
const MAX_CHARS = 8000;
const STEPS = [
  { key: "describe", label: "Describe" },
  { key: "edit", label: "Edit" },
  { key: "preview", label: "Preview & Export" },
];

const GenerateResume = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { providers, provider, setProvider, backendUp } = useProviders();

  const [step, setStep] = useState("describe");
  const [data, setData] = useState(emptyResume());
  const [savedId, setSavedId] = useState(null);
  const [template, setTemplate] = useState("modern");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [meta, setMeta] = useState(null);
  const fileRef = useRef(null);

  const form = useForm({ defaultValues: emptyResume() });
  const draft = loadDraft();

  // Open a saved resume: /generate-resume?id=...&view=preview
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const saved = getResume(id);
    if (!saved) {
      toast.error("Resume not found");
      return;
    }
    const d = normalizeResume(saved.data);
    setSavedId(saved.id);
    setTemplate(saved.template || "modern");
    setData(d);
    form.reset(d);
    setStep(searchParams.get("view") === "preview" ? "preview" : "edit");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Elapsed-time counter while the LLM works
  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const openInEditor = (resume) => {
    const d = normalizeResume(resume);
    form.reset(d);
    setData(d);
    saveDraft(d);
    setSavedId(null);
    setSearchParams({});
    setStep("edit");
  };

  const handleGenerate = async () => {
    const text = description.trim();
    if (text.length < MIN_CHARS) {
      toast.error(`Please write at least ${MIN_CHARS} characters about yourself.`);
      return;
    }
    try {
      setLoading(true);
      const res = await generateResume(text, provider);
      setMeta(res.meta);
      openInEditor(res.data);
      toast.success("Resume generated! Review and edit the details.");
    } catch (error) {
      toast.error(errorMessage(error), { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      openInEditor(await readJsonFile(file));
      toast.success("Resume imported");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onSubmit = (values) => {
    const d = normalizeResume(values);
    setData(d);
    saveDraft(d);
    setStep("preview");
    window.scrollTo(0, 0);
  };

  const handleSave = () => {
    const id = saveResume({ id: savedId, data, template });
    setSavedId(id);
    toast.success(savedId ? "Resume updated" : "Saved to My Resumes");
    return id;
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="px-4 py-8 md:px-10 flex flex-col gap-6 items-center">
      <ul className="steps w-full max-w-xl no-print">
        {STEPS.map((s, i) => (
          <li key={s.key} className={`step ${i <= stepIndex ? "step-primary" : ""}`}>{s.label}</li>
        ))}
      </ul>

      {step === "describe" && (
        <div className="bg-base-200 shadow-lg rounded-box p-6 md:p-10 max-w-3xl w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-2">
            <FaBrain className="text-accent" /> Describe yourself
          </h1>
          <p className="mb-6 text-center opacity-70">
            Include your name, contact details, roles, dates, achievements (with numbers if you have them),
            education, skills and projects. Order doesn't matter.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm opacity-70 self-center">Try a sample:</span>
            {SAMPLE_PROMPTS.map((s) => (
              <button key={s.label} className="btn btn-xs btn-outline" disabled={loading} onClick={() => setDescription(s.text)}>
                {s.label}
              </button>
            ))}
          </div>

          <textarea
            disabled={loading}
            className="textarea textarea-bordered w-full h-64 resize-y text-base"
            placeholder="e.g. I'm Priya, a Java backend developer in Hyderabad with 3 years at Infosys building Spring Boot microservices..."
            value={description}
            maxLength={MAX_CHARS}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-between text-xs opacity-70 mb-4">
            <span>{description.trim().length < MIN_CHARS ? `At least ${MIN_CHARS} characters` : "Looks good"}</span>
            <span>{description.length} / {MAX_CHARS}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <ProviderSelect providers={providers} value={provider} onChange={setProvider} backendUp={backendUp} />
            <div className="flex gap-2">
              <button disabled={loading} onClick={() => setDescription("")} className="btn btn-ghost">
                <FaTrash /> Clear
              </button>
              <button disabled={loading || !backendUp} onClick={handleGenerate} className="btn btn-primary">
                {loading ? <span className="loading loading-spinner" /> : <FaPaperPlane />}
                {loading ? `Generating… ${elapsed}s` : "Generate Resume"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-6 space-y-2">
              <progress className="progress progress-primary w-full" />
              <p className="text-sm text-center opacity-70">The AI is structuring your experience into a resume…</p>
            </div>
          )}

          <div className="divider">or</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {draft?.data && (
              <button className="btn btn-sm btn-outline" onClick={() => openInEditor(draft.data)}>
                <FaHistory /> Continue last draft
              </button>
            )}
            <button className="btn btn-sm btn-outline" onClick={() => openInEditor(emptyResume())}>
              <FaPen /> Start from a blank form
            </button>
            <button className="btn btn-sm btn-outline" onClick={() => fileRef.current?.click()}>
              <FaFileImport /> Import JSON
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          </div>
        </div>
      )}

      {step === "edit" && (
        <>
          <MetaBadge meta={meta} />
          <ResumeForm form={form} onSubmit={onSubmit} provider={provider} />
          <button className="btn btn-ghost btn-sm" onClick={() => setStep("describe")}>
            <FaRedo /> Start over with a new description
          </button>
        </>
      )}

      {step === "preview" && (
        <Resume data={data} template={template} onTemplateChange={setTemplate}>
          <button onClick={() => setStep("edit")} className="btn btn-success">
            <FaEdit /> Edit
          </button>
          <button onClick={handleSave} className="btn btn-secondary">
            <FaSave /> {savedId ? "Update saved resume" : "Save to My Resumes"}
          </button>
          <button onClick={() => navigate(`/job-match?id=${handleSave()}`)} className="btn btn-info">
            <FaBullseye /> Check ATS score
          </button>
          <button
            onClick={() => {
              setSearchParams({});
              setSavedId(null);
              setStep("describe");
            }}
            className="btn btn-accent"
          >
            <FaRedo /> Generate another
          </button>
        </Resume>
      )}
    </div>
  );
};

export default GenerateResume;
