/** Resumes are stored in the browser (localStorage) - no account needed. */
const KEY = "airesume.saved.v1";
const DRAFT_KEY = "airesume.draft.v1";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};
const write = (list) => localStorage.setItem(KEY, JSON.stringify(list));

export const listResumes = () => read().sort((a, b) => b.updatedAt - a.updatedAt);

export const getResume = (id) => read().find((r) => r.id === id) || null;

export function saveResume({ id, name, template, data }) {
  const list = read();
  const now = Date.now();
  const existing = id ? list.find((r) => r.id === id) : null;
  if (existing) {
    Object.assign(existing, { name: name ?? existing.name, template: template ?? existing.template, data, updatedAt: now });
    write(list);
    return existing.id;
  }
  const newId = (crypto.randomUUID && crypto.randomUUID()) || String(now);
  list.push({
    id: newId,
    name: name || data?.personalInformation?.fullName || "Untitled resume",
    template: template || "modern",
    data,
    createdAt: now,
    updatedAt: now,
  });
  write(list);
  return newId;
}

export const deleteResume = (id) => write(read().filter((r) => r.id !== id));

export function duplicateResume(id) {
  const r = getResume(id);
  if (!r) return null;
  return saveResume({ name: `${r.name} (copy)`, template: r.template, data: structuredClone(r.data) });
}

export const saveDraft = (data) => localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, savedAt: Date.now() }));
export const loadDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY));
  } catch {
    return null;
  }
};
export const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

export function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  downloadBlob(blob, filename);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch {
        reject(new Error("That file is not valid JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}
