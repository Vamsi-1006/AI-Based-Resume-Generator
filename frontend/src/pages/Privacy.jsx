import React from "react";
import LegalPage from "./LegalPage";

const SECTIONS = [
  ["What we collect", "We do not require an account. Text you submit for AI processing (descriptions, resumes, job descriptions) is sent to our server only to fulfil that request."],
  ["Where your resumes live", "Saved resumes and drafts are stored in your browser's local storage on your device. We do not keep a database of resumes."],
  ["AI providers", "To generate content, your request is forwarded to a third-party AI provider (for example Groq, Google, OpenAI, xAI or Anthropic). Their own privacy policies apply to that processing. Avoid including sensitive personal data you don't want processed."],
  ["Caching and logs", "Identical AI requests may be cached in server memory for up to 30 minutes to save quota. Server logs record technical metadata such as latency and token counts, not your resume content."],
  ["Contact form", "Messages sent through the contact form are used only to reply to you."],
  ["Your choices", "You can delete saved resumes at any time from My Resumes, or clear your browser storage to remove everything."],
];

export default function Privacy() {
  return <LegalPage title="Privacy Policy" updated="October 2026" sections={SECTIONS} />;
}
