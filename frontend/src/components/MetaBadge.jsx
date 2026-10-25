import React from "react";

/** Shows which model answered, latency, tokens, and cache hits - useful for demos. */
function MetaBadge({ meta }) {
  if (!meta) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs opacity-80 justify-center">
      {meta.provider && <span className="badge badge-ghost">via {meta.provider}</span>}
      {meta.model && <span className="badge badge-ghost">{meta.model}</span>}
      {meta.latencyMs != null && <span className="badge badge-ghost">{(meta.latencyMs / 1000).toFixed(1)}s</span>}
      {meta.completionTokens > 0 && (
        <span className="badge badge-ghost">{meta.promptTokens + meta.completionTokens} tokens</span>
      )}
      {meta.cached && <span className="badge badge-success">cached</span>}
    </div>
  );
}

export default MetaBadge;
