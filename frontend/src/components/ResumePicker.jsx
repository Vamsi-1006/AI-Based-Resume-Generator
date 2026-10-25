import React, { useMemo } from "react";
import { Link } from "react-router";
import { listResumes, loadDraft } from "../utils/storage";

/** Pick which resume to use: the current draft or any saved resume. */
function ResumePicker({ value, onChange }) {
  const options = useMemo(() => {
    const opts = [];
    const draft = loadDraft();
    if (draft?.data) {
      opts.push({ id: "draft", name: `Current draft - ${draft.data.personalInformation?.fullName || "unnamed"}`, data: draft.data });
    }
    listResumes().forEach((r) => opts.push({ id: r.id, name: r.name, data: r.data }));
    return opts;
  }, []);

  if (!options.length) {
    return (
      <div className="alert">
        <span>
          You don't have a resume yet.{" "}
          <Link to="/generate-resume" className="link link-primary">Build one first</Link> - it takes a minute.
        </span>
      </div>
    );
  }

  return (
    <label className="form-control w-full">
      <div className="label"><span className="label-text font-semibold">Resume</span></div>
      <select
        className="select select-bordered"
        value={value?.id || ""}
        onChange={(e) => onChange(options.find((o) => o.id === e.target.value) || null)}
      >
        <option value="" disabled>Select a resume</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </label>
  );
}

export default ResumePicker;
