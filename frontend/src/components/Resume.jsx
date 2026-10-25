import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";
import { FaPrint, FaFilePdf, FaFileCode } from "react-icons/fa";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import { normalizeResume } from "../utils/resumeSchema";
import { downloadJson } from "../utils/storage";

export const TEMPLATES = {
  modern: { label: "Modern", component: ModernTemplate },
  classic: { label: "Classic (ATS)", component: ClassicTemplate },
  minimal: { label: "Minimal", component: MinimalTemplate },
};

const Resume = ({ data, template = "modern", onTemplateChange, children }) => {
  const resumeRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const resume = normalizeResume(data);
  const fileName = (resume.personalInformation.fullName || "resume").trim().replace(/\s+/g, "_");
  const Template = (TEMPLATES[template] || TEMPLATES.modern).component;

  // Native print dialog -> "Save as PDF" gives selectable, ATS-readable text.
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: fileName,
  });

  // Image-based PDF, split across as many A4 pages as needed.
  const handleDownloadPdf = async () => {
    try {
      setExporting(true);
      const node = resumeRef.current;
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true });
      const img = new Image();
      img.src = dataUrl;
      await img.decode();

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (img.height * pageW) / img.width;

      let offset = 0;
      pdf.addImage(dataUrl, "PNG", 0, 0, pageW, imgH);
      while (imgH - offset > pageH + 1) {
        offset += pageH;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, -offset, pageW, imgH);
      }
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
      toast.error("Could not create PDF - try Print → Save as PDF instead.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="no-print w-full max-w-[820px] flex flex-wrap items-center justify-between gap-3 bg-base-200 rounded-box p-3">
        <div role="tablist" className="tabs tabs-boxed bg-base-100">
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              role="tab"
              className={`tab ${template === key ? "tab-active" : ""}`}
              onClick={() => onTemplateChange?.(key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handlePrint()} className="btn btn-primary btn-sm">
            <FaPrint /> Print
          </button>
          <button onClick={handleDownloadPdf} className="btn btn-outline btn-sm" disabled={exporting}>
            {exporting ? <span className="loading loading-spinner loading-xs" /> : <FaFilePdf />} PDF
          </button>
          <button onClick={() => downloadJson(resume, `${fileName}.json`)} className="btn btn-ghost btn-sm">
            <FaFileCode /> JSON
          </button>
        </div>
      </div>

      <div ref={resumeRef} className="resume-paper shadow-2xl rounded-sm overflow-hidden bg-white">
        <Template data={resume} />
      </div>

      {children && <div className="no-print flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
};

export default Resume;
