import React from "react";

/** Shared layout for Privacy / Terms. */
function LegalPage({ title, updated, sections }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="opacity-60 mb-8">Last updated: {updated}</p>
      <div className="space-y-6">
        {sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 className="text-xl font-semibold mb-2">{heading}</h2>
            <p className="opacity-85 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default LegalPage;
