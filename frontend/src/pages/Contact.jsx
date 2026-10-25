import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { sendContact } from "../api/ResumeService";
import { errorMessage } from "../api/client";

const FAQ = [
  { q: "Is it free?", a: "Yes. The app runs on free-tier AI models. Heavy usage may be rate-limited for a minute." },
  { q: "Where are my resumes stored?", a: "Only in your browser's local storage. Clearing browser data removes them - export JSON for backups." },
  { q: "Will the AI make things up?", a: "It is instructed not to invent facts. Always review the output - you're the final editor." },
  { q: "Which PDF option should I use?", a: "Use Print → Save as PDF for a text-based PDF that ATS systems can read. The PDF button creates an image-based copy." },
];

function Contact() {
  const [sent, setSent] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      const res = await sendContact(values);
      setSent(res.message);
      reset();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const err = (name) => errors[name] && <span className="label-text-alt text-error">{errors[name].message}</span>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Contact us</h1>
        <p className="text-lg opacity-80">Questions, feedback or a bug to report? We'd love to hear from you.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          {[
            { icon: <FaEnvelope />, title: "Email", text: "support@airesumemaker.dev" },
            { icon: <FaMapMarkerAlt />, title: "Location", text: "Hyderabad, India" },
            { icon: <FaClock />, title: "Response time", text: "Usually within 1-2 business days" },
          ].map((c) => (
            <div key={c.title} className="card bg-base-200">
              <div className="card-body flex-row items-center gap-4 py-5">
                <div className="text-2xl text-primary">{c.icon}</div>
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="opacity-80 text-sm">{c.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 card bg-base-200">
          <div className="card-body">
            {sent ? (
              <div className="text-center py-10 space-y-4">
                <FaCheckCircle className="text-5xl text-success mx-auto" />
                <p className="text-xl font-semibold">{sent}</p>
                <button className="btn btn-outline btn-sm" onClick={() => setSent(null)}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="form-control">
                    <div className="label"><span className="label-text">Name *</span>{err("name")}</div>
                    <input className="input input-bordered" {...register("name", { required: "Required", maxLength: { value: 100, message: "Too long" } })} />
                  </label>
                  <label className="form-control">
                    <div className="label"><span className="label-text">Email *</span>{err("email")}</div>
                    <input type="email" className="input input-bordered" {...register("email", { required: "Required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })} />
                  </label>
                </div>
                <label className="form-control">
                  <div className="label"><span className="label-text">Subject</span></div>
                  <select className="select select-bordered" {...register("subject")}>
                    <option>General question</option>
                    <option>Bug report</option>
                    <option>Feature request</option>
                    <option>Partnership</option>
                  </select>
                </label>
                <label className="form-control">
                  <div className="label"><span className="label-text">Message *</span>{err("message")}</div>
                  <textarea className="textarea textarea-bordered h-36" {...register("message", { required: "Required", minLength: { value: 10, message: "At least 10 characters" } })} />
                </label>
                <button className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loading loading-spinner" /> : <FaPaperPlane />} Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <div key={f.q} className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq" defaultChecked={i === 0} />
              <div className="collapse-title font-medium">{f.q}</div>
              <div className="collapse-content opacity-80"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Contact;
