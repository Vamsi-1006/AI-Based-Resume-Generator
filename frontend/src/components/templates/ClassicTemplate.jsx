import React from "react";
import { Bullets, ContactLinks, has } from "./common";

const Heading = ({ children }) => (
  <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-800 mb-2 mt-4">{children}</h2>
);

/** Single-column, serif, very ATS-friendly. */
function ClassicTemplate({ data }) {
  const pi = data.personalInformation;
  return (
    <div className="bg-white text-gray-900 px-10 py-8 font-serif text-[13px] leading-snug">
      <header className="text-center">
        <h1 className="text-3xl font-bold">{pi.fullName || "Your Name"}</h1>
        <ContactLinks pi={pi} className="text-xs mt-1" />
      </header>

      {data.summary && (
        <>
          <Heading>Summary</Heading>
          <p>{data.summary}</p>
        </>
      )}

      {has(data.experience) && (
        <>
          <Heading>Professional Experience</Heading>
          {data.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <span className="font-bold">{e.company}</span>
                <span>{e.location}</span>
              </div>
              <div className="flex justify-between italic">
                <span>{e.jobTitle}</span>
                <span>{e.duration}</span>
              </div>
              <Bullets text={e.responsibility} className="mt-1" />
            </div>
          ))}
        </>
      )}

      {has(data.projects) && (
        <>
          <Heading>Projects</Heading>
          {data.projects.map((p, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold">{p.title}</span>
              {p.technologiesUsed && <span className="italic"> | {p.technologiesUsed}</span>}
              <Bullets text={p.description} />
            </div>
          ))}
        </>
      )}

      {has(data.education) && (
        <>
          <Heading>Education</Heading>
          {data.education.map((e, i) => (
            <div key={i} className="flex justify-between mb-1">
              <span>
                <span className="font-bold">{e.degree}</span>
                {e.university && `, ${e.university}`}
                {e.location && `, ${e.location}`}
              </span>
              <span>{e.graduationYear}</span>
            </div>
          ))}
        </>
      )}

      {has(data.skills) && (
        <>
          <Heading>Skills</Heading>
          <p>{data.skills.map((s) => s.title).filter(Boolean).join(" • ")}</p>
        </>
      )}

      {has(data.certifications) && (
        <>
          <Heading>Certifications</Heading>
          <ul className="list-disc pl-5">
            {data.certifications.map((c, i) => (
              <li key={i}>
                {c.title}
                {c.issuingOrganization && ` - ${c.issuingOrganization}`}
                {c.year && ` (${c.year})`}
              </li>
            ))}
          </ul>
        </>
      )}

      {has(data.achievements) && (
        <>
          <Heading>Achievements</Heading>
          <ul className="list-disc pl-5">
            {data.achievements.map((a, i) => (
              <li key={i}>
                <span className="font-semibold">{a.title}</span>
                {a.year && ` (${a.year})`}
                {a.extraInformation && ` - ${a.extraInformation}`}
              </li>
            ))}
          </ul>
        </>
      )}

      {(has(data.languages) || has(data.interests)) && (
        <>
          <Heading>Additional</Heading>
          {has(data.languages) && <p><span className="font-semibold">Languages:</span> {data.languages.map((l) => l.name).join(", ")}</p>}
          {has(data.interests) && <p><span className="font-semibold">Interests:</span> {data.interests.map((l) => l.name).join(", ")}</p>}
        </>
      )}
    </div>
  );
}

export default ClassicTemplate;
