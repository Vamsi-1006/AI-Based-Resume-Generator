import React from "react";
import { Link } from "react-router";
import { FaMagic, FaBullseye, FaEnvelopeOpenText, FaComments, FaPalette, FaShieldAlt } from "react-icons/fa";

const FEATURES = [
  { icon: <FaMagic />, title: "Describe → Resume", text: "Write about yourself in plain words. The AI structures it into a clean, professional resume you can edit." },
  { icon: <FaBullseye />, title: "ATS Score", text: "Paste a job description and get a hybrid score: real keyword coverage plus an AI recruiter review." },
  { icon: <FaMagic />, title: "One-click Tailoring", text: "Rewrite your resume for a specific job - without inventing anything you haven't done." },
  { icon: <FaEnvelopeOpenText />, title: "Cover Letters", text: "Generate a personalised cover letter that streams in live, then copy or download it." },
  { icon: <FaComments />, title: "Interview Prep", text: "Get likely interview questions for the role, with tips grounded in your own experience." },
  { icon: <FaPalette />, title: "Templates & Print", text: "Switch between Modern, Classic (ATS-friendly) and Minimal layouts. Print or export to PDF." },
];

const STEPS = [
  { title: "Describe yourself", text: "Experience, skills, projects - in any order, in your own words." },
  { title: "Review & polish", text: "Edit every field. Use “Improve with AI” on bullets and summaries." },
  { title: "Target & export", text: "Check your ATS score, tailor for a job, then print or download." },
];

const LandingPage = () => {
  return (
    <div className="bg-base-100">
      {/* Hero */}
      <section className="hero min-h-[80vh] bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <span className="badge badge-primary badge-outline mb-4">Powered by your choice of LLM</span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Create a job-winning resume <span className="text-primary">with AI</span>
            </h1>
            <p className="py-6 text-lg opacity-80">
              Describe yourself, get a structured resume in seconds, then tailor it to any job description and
              check how well it scores against applicant tracking systems.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/generate-resume" className="btn btn-primary btn-lg">Build my resume</Link>
              <Link to="/job-match" className="btn btn-outline btn-lg">Check ATS score</Link>
            </div>
            <p className="mt-4 text-sm opacity-60">Free · No sign-up · Resumes stay in your browser</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How it works</h2>
          <ul className="steps steps-vertical lg:steps-horizontal w-full">
            {STEPS.map((s) => (
              <li key={s.title} className="step step-primary">
                <div className="text-left lg:text-center px-4">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm opacity-70">{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-base-200" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Everything you need to apply with confidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className="text-3xl text-primary">{f.icon}</div>
                  <h3 className="card-title">{f.title}</h3>
                  <p className="opacity-80">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-sm opacity-70">
            <FaShieldAlt /> The AI is instructed never to invent employers, dates, degrees or metrics.
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">What our users say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { quote: "This AI resume maker saved me so much time! My resume looks professional and got me multiple interviews.", name: "John Doe", role: "Software Engineer", img: "https://randomuser.me/api/portraits/men/1.jpg" },
              { quote: "The ATS checker showed exactly which keywords I was missing. Tailoring took one click.", name: "Jane Smith", role: "Marketing Specialist", img: "https://randomuser.me/api/portraits/women/2.jpg" },
            ].map((t) => (
              <div key={t.name} className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <p className="italic">“{t.quote}”</p>
                  <div className="flex items-center mt-4">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img src={t.img} alt={t.name} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-sm opacity-70">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to create your resume?</h2>
          <p className="mb-8 text-lg opacity-90">It takes about a minute to get your first draft.</p>
          <Link to="/generate-resume" className="btn btn-lg bg-base-100 text-base-content border-0 hover:bg-base-200">
            Get started now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
