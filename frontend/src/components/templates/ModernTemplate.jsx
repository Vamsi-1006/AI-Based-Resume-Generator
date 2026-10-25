import React from "react";
import { Bullets, ContactLinks, has, href } from "./common";

const Heading = ({ children }) => (
  <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-700 border-b-2 border-indigo-100 pb-1 mb-2">
    {children}
  </h2>
);

/** Two-column modern layout with an accent header. */
function ModernTemplate({ data }) {
  const pi = data.personalInformation;
  return (
    <div className="bg-white text-gray-800 text-[13px] leading-snug">
      <header className="bg-indigo-700 text-white px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight">{pi.fullName || "Your Name"}</h1>
        {data.experience[0]?.jobTitle && <p className="text-indigo-100 text-base mt-0.5">{data.experience[0].jobTitle}</p>}
        <ContactLinks pi={pi} className="mt-2 text-indigo-50 text-xs [&_a]:underline-offset-2 [&_a:hover]:underline" />
      </header>

      <div className="grid grid-cols-3 gap-6 px-8 py-6">
        <main className="col-span-2 space-y-5">
          {data.summary && (
            <section>
              <Heading>Profile</Heading>
              <p>{data.summary}</p>
            </section>
          )}
          {has(data.experience) && (
            <section>
              <Heading>Experience</Heading>
              <div className="space-y-3">
                {data.experience.map((e, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-semibold text-gray-900">{e.jobTitle}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{e.duration}</span>
                    </div>
                    <p className="text-indigo-700 text-xs font-medium">
                      {[e.company, e.location].filter(Boolean).join(" · ")}
                    </p>
                    <Bullets text={e.responsibility} className="mt-1" />
                  </div>
                ))}
              </div>
            </section>
          )}
          {has(data.projects) && (
            <section>
              <Heading>Projects</Heading>
              <div className="space-y-3">
                {data.projects.map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      {p.githubLink && (
                        <a href={href(p.githubLink)} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600">
                          View project ↗
                        </a>
                      )}
                    </div>
                    <Bullets text={p.description} />
                    {p.technologiesUsed && <p className="text-xs text-gray-500 mt-0.5">Tech: {p.technologiesUsed}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-5">
          {has(data.skills) && (
            <section>
              <Heading>Skills</Heading>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-xs" title={s.level}>
                    {s.title}
                  </span>
                ))}
              </div>
            </section>
          )}
          {has(data.education) && (
            <section>
              <Heading>Education</Heading>
              {data.education.map((e, i) => (
                <div key={i} className="mb-2">
                  <p className="font-semibold text-gray-900">{e.degree}</p>
                  <p className="text-xs">{[e.university, e.location].filter(Boolean).join(", ")}</p>
                  {e.graduationYear && <p className="text-xs text-gray-500">{e.graduationYear}</p>}
                </div>
              ))}
            </section>
          )}
          {has(data.certifications) && (
            <section>
              <Heading>Certifications</Heading>
              {data.certifications.map((c, i) => (
                <div key={i} className="mb-2">
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">{[c.issuingOrganization, c.year].filter(Boolean).join(" · ")}</p>
                </div>
              ))}
            </section>
          )}
          {has(data.achievements) && (
            <section>
              <Heading>Achievements</Heading>
              {data.achievements.map((a, i) => (
                <div key={i} className="mb-2">
                  <p className="font-medium text-gray-900">{a.title} {a.year && <span className="text-xs text-gray-500">({a.year})</span>}</p>
                  {a.extraInformation && <p className="text-xs">{a.extraInformation}</p>}
                </div>
              ))}
            </section>
          )}
          {has(data.languages) && (
            <section>
              <Heading>Languages</Heading>
              <p>{data.languages.map((l) => l.name).filter(Boolean).join(", ")}</p>
            </section>
          )}
          {has(data.interests) && (
            <section>
              <Heading>Interests</Heading>
              <p>{data.interests.map((l) => l.name).filter(Boolean).join(", ")}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ModernTemplate;
