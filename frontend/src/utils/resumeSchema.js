/** Single source of truth for resume sections - used by the form, templates and storage. */
export const SECTION_FIELDS = {
  skills: { label: "Skills", fields: ["title", "level"] },
  experience: { label: "Experience", fields: ["jobTitle", "company", "location", "duration", "responsibility"] },
  education: { label: "Education", fields: ["degree", "university", "location", "graduationYear"] },
  certifications: { label: "Certifications", fields: ["title", "issuingOrganization", "year"] },
  projects: { label: "Projects", fields: ["title", "description", "technologiesUsed", "githubLink"] },
  achievements: { label: "Achievements", fields: ["title", "year", "extraInformation"] },
  languages: { label: "Languages", fields: ["name"] },
  interests: { label: "Interests", fields: ["name"] },
};

export const FIELD_LABELS = {
  title: "Title",
  level: "Level",
  jobTitle: "Job Title",
  company: "Company",
  location: "Location",
  duration: "Duration",
  responsibility: "Responsibilities (one bullet per line)",
  degree: "Degree",
  university: "University",
  graduationYear: "Graduation Year",
  issuingOrganization: "Issuing Organization",
  year: "Year",
  description: "Description",
  technologiesUsed: "Technologies (comma separated)",
  githubLink: "GitHub / Demo Link",
  extraInformation: "Details",
  name: "Name",
};

/** Fields rendered as textarea + offered "Improve with AI". */
export const LONG_FIELDS = ["responsibility", "description", "extraInformation"];

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function emptyResume() {
  return {
    personalInformation: {
      fullName: "",
      email: "",
      phoneNumber: "",
      location: "",
      linkedIn: "",
      gitHub: "",
      portfolio: "",
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    achievements: [],
    languages: [],
    interests: [],
  };
}

/** Makes any (possibly partial / older) resume object safe to render. */
export function normalizeResume(data) {
  const base = emptyResume();
  if (!data || typeof data !== "object") return base;
  const pi = data.personalInformation || {};
  return {
    ...base,
    ...data,
    personalInformation: {
      ...base.personalInformation,
      ...pi,
      linkedIn: pi.linkedIn || pi.linkedin || "",
      gitHub: pi.gitHub || pi.github || "",
    },
    summary: data.summary || "",
    ...Object.fromEntries(
      Object.keys(SECTION_FIELDS).map((k) => [k, Array.isArray(data[k]) ? data[k] : []])
    ),
  };
}

/** "- a\n- b" or "a. b" -> ["a", "b"] */
export function toBullets(text) {
  if (!text) return [];
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
  return lines;
}

export function hasContent(list) {
  return Array.isArray(list) && list.some((item) => Object.values(item || {}).some((v) => String(v || "").trim()));
}
