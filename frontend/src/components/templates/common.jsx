import React from "react";
import { toBullets, hasContent } from "../../utils/resumeSchema";

export const has = hasContent;

export function Bullets({ text, className = "" }) {
  const items = toBullets(text);
  if (items.length <= 1) return <p className={className}>{items[0] || ""}</p>;
  return (
    <ul className={`list-disc pl-5 space-y-0.5 ${className}`}>
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

export const cleanUrl = (url = "") => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
export const href = (url = "") => (/^https?:\/\//.test(url) ? url : `https://${url}`);

export function ContactLinks({ pi, separator = " | ", className = "" }) {
  const parts = [
    pi.email && <a key="e" href={`mailto:${pi.email}`}>{pi.email}</a>,
    pi.phoneNumber && <span key="p">{pi.phoneNumber}</span>,
    pi.location && <span key="l">{pi.location}</span>,
    pi.linkedIn && <a key="li" href={href(pi.linkedIn)} target="_blank" rel="noopener noreferrer">{cleanUrl(pi.linkedIn)}</a>,
    pi.gitHub && <a key="gh" href={href(pi.gitHub)} target="_blank" rel="noopener noreferrer">{cleanUrl(pi.gitHub)}</a>,
    pi.portfolio && <a key="pf" href={href(pi.portfolio)} target="_blank" rel="noopener noreferrer">{cleanUrl(pi.portfolio)}</a>,
  ].filter(Boolean);
  return (
    <p className={className}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="opacity-50">{separator}</span>}
          {p}
        </React.Fragment>
      ))}
    </p>
  );
}
