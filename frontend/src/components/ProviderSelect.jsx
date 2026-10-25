import React from "react";
import { FaRobot } from "react-icons/fa";

/** Lets the user pick which LLM to use. "Auto" = default provider + fallback chain. */
function ProviderSelect({ providers, value, onChange, backendUp = true, compact = false }) {
  if (!backendUp) {
    return (
      <div className="alert alert-warning py-2 text-sm">
        Backend not reachable on port 8080 - start Spring Boot first.
      </div>
    );
  }
  const configured = providers.filter((p) => p.configured);
  return (
    <label className={`form-control ${compact ? "w-56" : "w-full max-w-xs"}`}>
      {!compact && (
        <div className="label">
          <span className="label-text flex items-center gap-2"><FaRobot /> AI model</span>
        </div>
      )}
      <select className="select select-bordered select-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Auto (default + fallback)</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id} disabled={!p.configured}>
            {p.name} {p.configured ? "" : "(no API key)"}
          </option>
        ))}
      </select>
      {providers.length > 0 && configured.length === 0 && (
        <div className="label">
          <span className="label-text-alt text-error">No provider configured - add GROQ_API_KEY to backend/.env</span>
        </div>
      )}
    </label>
  );
}

export default ProviderSelect;
