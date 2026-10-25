import React, { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { FaTrash, FaPlusCircle, FaMagic, FaEye, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { BiBook } from "react-icons/bi";
import { improveText } from "../api/ResumeService";
import { errorMessage } from "../api/client";
import { SECTION_FIELDS, FIELD_LABELS, LONG_FIELDS, SKILL_LEVELS } from "../utils/resumeSchema";
import { saveDraft } from "../utils/storage";

function ImproveButton({ busy, onClick }) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className="btn btn-xs btn-accent btn-outline gap-1">
      {busy ? <span className="loading loading-spinner loading-xs" /> : <FaMagic />} Improve with AI
    </button>
  );
}

function SectionArray({ control, register, name, label, fields, improving, onImprove }) {
  const { fields: rows, append, remove, move } = useFieldArray({ control, name });
  const empty = fields.reduce((acc, k) => ({ ...acc, [k]: "" }), {});

  return (
    <div className="collapse collapse-arrow bg-base-100 border border-base-300">
      <input type="checkbox" defaultChecked={rows.length > 0 && name !== "languages" && name !== "interests"} />
      <div className="collapse-title text-lg font-semibold">
        {label} <span className="badge badge-neutral badge-sm ml-2">{rows.length}</span>
      </div>
      <div className="collapse-content space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="p-4 rounded-lg bg-base-200 border border-base-300">
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((key) => {
                const path = `${name}.${index}.${key}`;
                const isLong = LONG_FIELDS.includes(key);
                return (
                  <label key={key} className={`form-control w-full ${isLong ? "md:col-span-2" : ""}`}>
                    <div className="label py-1">
                      <span className="label-text">{FIELD_LABELS[key] || key}</span>
                      {isLong && <ImproveButton busy={improving === path} onClick={() => onImprove(path, `${label} - ${FIELD_LABELS[key]}`)} />}
                    </div>
                    {key === "level" ? (
                      <select {...register(path)} className="select select-bordered select-sm">
                        <option value="">-</option>
                        {SKILL_LEVELS.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    ) : isLong ? (
                      <textarea {...register(path)} rows={key === "responsibility" ? 5 : 3} className="textarea textarea-bordered w-full" />
                    ) : (
                      <input {...register(path)} className="input input-bordered input-sm w-full" />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => remove(index)} className="btn btn-error btn-xs btn-outline">
                <FaTrash /> Remove
              </button>
              <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} className="btn btn-ghost btn-xs" aria-label="Move up">
                <FaArrowUp />
              </button>
              <button type="button" disabled={index === rows.length - 1} onClick={() => move(index, index + 1)} className="btn btn-ghost btn-xs" aria-label="Move down">
                <FaArrowDown />
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => append(empty)} className="btn btn-secondary btn-sm">
          <FaPlusCircle /> Add {label}
        </button>
      </div>
    </div>
  );
}

/** Full editable resume form. `form` is the object returned by useForm(). */
function ResumeForm({ form, onSubmit, provider }) {
  const { register, control, handleSubmit, getValues, setValue, watch } = form;
  const [improving, setImproving] = useState(null);
  const [targetRole, setTargetRole] = useState("");

  // Autosave every change to a local draft (debounced).
  useEffect(() => {
    let t;
    const sub = watch((values) => {
      clearTimeout(t);
      t = setTimeout(() => saveDraft(values), 600);
    });
    return () => {
      clearTimeout(t);
      sub.unsubscribe();
    };
  }, [watch]);

  const onImprove = async (path, section) => {
    const text = getValues(path);
    if (!text || !String(text).trim()) {
      toast.error("Write something first, then let AI polish it.");
      return;
    }
    try {
      setImproving(path);
      const res = await improveText({ section, text, targetRole, provider });
      setValue(path, res.data.improved, { shouldDirty: true });
      toast.success(res.data.tips?.[0] || "Improved!", { duration: 4000 });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setImproving(null);
    }
  };

  const pi = [
    ["fullName", "Full Name", "text"],
    ["email", "Email", "email"],
    ["phoneNumber", "Phone Number", "tel"],
    ["location", "Location", "text"],
    ["linkedIn", "LinkedIn URL", "text"],
    ["gitHub", "GitHub URL", "text"],
    ["portfolio", "Portfolio URL", "text"],
  ];

  return (
    <div className="w-full max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 flex items-center justify-center gap-2">
        <BiBook className="text-accent" /> Review & Edit
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-4 bg-base-200 rounded-box">
        <label className="form-control w-full max-w-md">
          <div className="label"><span className="label-text">Target role (helps "Improve with AI")</span></div>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Java Backend Engineer"
            className="input input-bordered input-sm"
          />
        </label>

        <div className="bg-base-100 border border-base-300 rounded-box p-4">
          <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pi.map(([key, label, type]) => (
              <label key={key} className="form-control w-full">
                <div className="label py-1"><span className="label-text">{label}</span></div>
                <input type={type} {...register(`personalInformation.${key}`)} className="input input-bordered input-sm w-full" />
              </label>
            ))}
          </div>
        </div>

        <div className="bg-base-100 border border-base-300 rounded-box p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Professional Summary</h3>
            <ImproveButton busy={improving === "summary"} onClick={() => onImprove("summary", "Professional Summary")} />
          </div>
          <textarea {...register("summary")} className="textarea textarea-bordered w-full" rows={4} />
        </div>

        {Object.entries(SECTION_FIELDS).map(([name, { label, fields }]) => (
          <SectionArray
            key={name}
            control={control}
            register={register}
            name={name}
            label={label}
            fields={fields}
            improving={improving}
            onImprove={onImprove}
          />
        ))}

        <button type="submit" className="btn btn-primary w-full">
          <FaEye /> Preview Resume
        </button>
      </form>
    </div>
  );
}

export default ResumeForm;
