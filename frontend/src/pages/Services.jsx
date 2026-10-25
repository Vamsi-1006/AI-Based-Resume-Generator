import React from "react";
import { Link } from "react-router";
import { FaMagic, FaBullseye, FaPenFancy, FaEnvelopeOpenText, FaComments, FaPrint, FaFolderOpen, FaRobot } from "react-icons/fa";

const SERVICES = [
  { icon: <FaMagic />, title: "AI Resume Generation", text: "Turn a free-text description into a structured resume with summary, experience bullets, skills and more.", to: "/generate-resume", cta: "Build resume" },
  { icon: <FaPenFancy />, title: "Improve with AI", text: "Polish any summary, bullet list or project description with stronger action verbs and clearer impact.", to: "/generate-resume", cta: "Open editor" },
  { icon: <FaBullseye />, title: "ATS Score Check", text: "Hybrid scoring: deterministic keyword coverage + an AI recruiter review with section scores and fixes.", to: "/job-match", cta: "Check score" },
  { icon: <FaMagic />, title: "Job Tailoring", text: "Re-target your resume for a specific job description while keeping every fact true. See what changed.", to: "/job-match", cta: "Tailor resume" },
  { icon: <FaEnvelopeOpenText />, title: "Cover Letters", text: "Personalised cover letters in your chosen tone, streamed live and fully editable.", to: "/cover-letter", cta: "Write letter" },
  { icon: <FaComments />, title: "Interview Prep", text: "Likely technical, behavioural and project questions for the role, with answer tips from your resume.", to: "/job-match", cta: "Prepare" },
  { icon: <FaPrint />, title: "Templates, Print & PDF", text: "Three professional templates. Print to a text-based PDF or download an image PDF.", to: "/generate-resume", cta: "See templates" },
  { icon: <FaFolderOpen />, title: "Resume Library", text: "Save multiple versions, duplicate, import and export as JSON - all stored locally.", to: "/my-resumes", cta: "My resumes" },
];

function Services() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Services</h1>
        <p className="text-lg opacity-80">Everything you need from first draft to interview - free while in beta.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map((s) => (
          <div key={s.title} className="card bg-base-200 hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="text-3xl text-primary">{s.icon}</div>
              <h3 className="card-title text-lg">{s.title}</h3>
              <p className="text-sm opacity-80">{s.text}</p>
              <div className="card-actions justify-end mt-2">
                <Link to={s.to} className="btn btn-sm btn-primary btn-outline">{s.cta}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert mt-12">
        <FaRobot className="text-2xl" />
        <span>
          Choose your AI model from the dropdown on any AI page. “Auto” uses the default model and falls back to others
          automatically if one is busy.
        </span>
      </div>
    </div>
  );
}

export default Services;
