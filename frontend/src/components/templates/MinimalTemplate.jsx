import React from "react";
import { Bullets, ContactLinks, has } from "./common";

const Row = ({ title, children }) => (
  <section className="grid grid-cols-[130px_1fr] gap-4 py-3 border-t border-gray-200">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-700 pt-0.5">{title}</h2>
    <div>{children}</div>
  </section>
);

/** Clean label-left layout with lots of whitespace. */
function MinimalTemplate({ data }) {
  const pi = data.personalInformation;
  return (
    <div className="bg-white text-gray-800 px-10 py-8 text-[13px] leading-snug">
      <header className="mb-4">
        <h1 className="text-4xl font-light tracking-tight text-gray-900">{pi.fullName || "Your Name"}</h1>
        <ContactLinks pi={pi} separator="  ·  " className="text-xs text-gray-500 mt-2" />
      </header>

      {data.summary && <Row title="About"><p>{data.summary}</p></Row>}

      {has(data.experience) && (
        <Row title="Experience">
          <div className="space-y-3">
            {data.experience.map((e, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900">
                  {e.jobTitle}
                  {e.company && <span className="font-normal"> at {e.company}</span>}
                </p>
                <p className="text-xs text-gray-500">{[e.duration, e.location].filter(Boolean).join(" · ")}</p>
                <Bullets text={e.responsibility} className="mt-1" />
              </div>
            ))}
          </div>
        </Row>
      )}

      {has(data.projects) && (
        <Row title="Projects">
          <div className="space-y-2">
            {data.projects.map((p, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900">{p.title}</p>
                <Bullets text={p.description} />
                {p.technologiesUsed && <p className="text-xs text-gray-500">{p.technologiesUsed}</p>}
              </div>
            ))}
          </div>
        </Row>
      )}

      {has(data.skills) && (
        <Row title="Skills">
          <p>{data.skills.map((s) => (s.level ? `${s.title} (${s.level})` : s.title)).join(", ")}</p>
        </Row>
      )}

      {has(data.education) && (
        <Row title="Education">
          {data.education.map((e, i) => (
            <p key={i}>
              <span className="font-semibold text-gray-900">{e.degree}</span> - {e.university}
              {e.graduationYear && <span className="text-gray-500"> ({e.graduationYear})</span>}
            </p>
          ))}
        </Row>
      )}

      {has(data.certifications) && (
        <Row title="Certifications">
          {data.certifications.map((c, i) => (
            <p key={i}>{[c.title, c.issuingOrganization, c.year].filter(Boolean).join(" · ")}</p>
          ))}
        </Row>
      )}

      {has(data.achievements) && (
        <Row title="Achievements">
          {data.achievements.map((a, i) => (
            <p key={i}>
              <span className="font-semibold">{a.title}</span>
              {a.year && ` (${a.year})`}
              {a.extraInformation && ` - ${a.extraInformation}`}
            </p>
          ))}
        </Row>
      )}

      {(has(data.languages) || has(data.interests)) && (
        <Row title="Personal">
          {has(data.languages) && <p>Languages: {data.languages.map((l) => l.name).join(", ")}</p>}
          {has(data.interests) && <p>Interests: {data.interests.map((l) => l.name).join(", ")}</p>}
        </Row>
      )}
    </div>
  );
}

export default MinimalTemplate;
