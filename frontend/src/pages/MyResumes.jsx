import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { FaEye, FaEdit, FaCopy, FaTrash, FaFileExport, FaFileImport, FaBullseye, FaPlus } from "react-icons/fa";
import { deleteResume, downloadJson, duplicateResume, listResumes, readJsonFile, saveResume } from "../utils/storage";
import { normalizeResume } from "../utils/resumeSchema";

function MyResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState(listResumes());
  const [toDelete, setToDelete] = useState(null);
  const fileRef = useRef(null);
  const refresh = () => setResumes(listResumes());

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const json = await readJsonFile(file);
      saveResume({ data: normalizeResume(json.data || json) });
      refresh();
      toast.success("Imported");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rename = (r) => {
    const name = window.prompt("Rename resume", r.name);
    if (name && name.trim()) {
      saveResume({ id: r.id, name: name.trim(), data: r.data });
      refresh();
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Resumes</h1>
          <p className="opacity-70">Stored privately in this browser.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}><FaFileImport /> Import JSON</button>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={handleImport} />
          <Link to="/generate-resume" className="btn btn-primary btn-sm"><FaPlus /> New resume</Link>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="hero bg-base-200 rounded-box py-16">
          <div className="hero-content text-center">
            <div>
              <p className="text-xl font-semibold">No saved resumes yet</p>
              <p className="opacity-70 mb-4">Generate one and click “Save to My Resumes”.</p>
              <Link to="/generate-resume" className="btn btn-primary">Build your first resume</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((r) => (
            <div key={r.id} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-lg transition-shadow">
              <div className="card-body">
                <h2 className="card-title cursor-pointer hover:underline" title="Click to rename" onClick={() => rename(r)}>{r.name}</h2>
                <p className="text-sm opacity-70">
                  {r.data?.experience?.[0]?.jobTitle || "-"} · {r.data?.skills?.length || 0} skills
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="badge badge-ghost capitalize">{r.template}</span>
                  <span className="badge badge-ghost">Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="card-actions justify-end mt-4 flex-wrap">
                  <button className="btn btn-xs btn-primary" onClick={() => navigate(`/generate-resume?id=${r.id}&view=preview`)}><FaEye /> Open</button>
                  <button className="btn btn-xs" onClick={() => navigate(`/generate-resume?id=${r.id}`)}><FaEdit /> Edit</button>
                  <button className="btn btn-xs" onClick={() => navigate(`/job-match?id=${r.id}`)}><FaBullseye /> ATS</button>
                  <button className="btn btn-xs btn-ghost" onClick={() => { duplicateResume(r.id); refresh(); }} aria-label="Duplicate"><FaCopy /></button>
                  <button className="btn btn-xs btn-ghost" onClick={() => downloadJson(r.data, `${r.name}.json`)} aria-label="Export"><FaFileExport /></button>
                  <button className="btn btn-xs btn-ghost text-error" onClick={() => setToDelete(r)} aria-label="Delete"><FaTrash /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete “{toDelete.name}”?</h3>
            <p className="py-4">This can't be undone.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setToDelete(null)}>Cancel</button>
              <button
                className="btn btn-error"
                onClick={() => {
                  deleteResume(toDelete.id);
                  setToDelete(null);
                  refresh();
                  toast.success("Deleted");
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default MyResumes;
