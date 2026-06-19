"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, RotateCcw, FileText, Loader2 } from "lucide-react";

type DocType = "cv" | "cover";

const STORAGE_PREFIX = "cvbuilder_v1_";

const PLACEHOLDER_CV = `# THABISO BLESSED NGULUBE
## Software Engineer | Full Stack Engineer
> Centurion, Gauteng | blessedngust13@gmail.com | +27 74 417 7166 | [LinkedIn](https://www.linkedin.com/in/thabiso-blessed/) | [GitHub](https://github.com/ThabisoBlessed) | [Portfolio](https://dynamic-folio-theta.vercel.app/blessedngust13)

### PROFESSIONAL SUMMARY
Lead Software Engineer at Massive Pty Ltd, building enterprise-grade web and mobile applications with a strong focus on real-time IoT systems, data pipelines, and cloud-native architectures. Proven ability to design and implement real-time data pipelines, integrate third-party APIs, and deploy scalable cloud solutions using AWS, Docker, and CI/CD pipelines.

### TECHNICAL SKILLS
**Frontend:** React, Next.js, React Native, Angular, Tailwind CSS, HTML5, CSS3, TypeScript, JavaScript
**Backend:** Node.js, Express.js, Python, Flask, Django REST Framework, Redis, MQTT
**Cloud & DevOps:** AWS (EC2, Lambda, S3, DynamoDB, Amplify, Rekognition), Docker, CI/CD, Linux
**Databases:** PostgreSQL, MySQL, MongoDB, DynamoDB
**APIs & Integrations:** Xero, ClickUp, Slack, Telegram, RESTful APIs, Real-Time Data Services
**Testing & Tools:** Jest, Postman, Git

### PROFESSIONAL EXPERIENCE
**Lead Software Engineer | Massive Group Pty Ltd, Centurion** — June 2023 – Present
- Led development and owned architecture of enterprise platforms across CRM, HR, Inventory, Inspections, LMS, and IoT workflows, collaborating with cross-functional teams in the mining technology sector.
- Built React Native mobile apps and Next.js dashboards enabling real-time KPI reporting and operational visibility for field teams; designed IoT data pipelines using Redis, MQTT, and Django for PLC telemetry processing.
- Integrated Xero, ClickUp, Slack, and Telegram APIs for automation; built automated PDF reporting engines with real-time data delivery.
- Deployed containerized microservices with Docker and CI/CD pipelines, improving deployment reliability and reducing release friction across multiple services
- Designed and maintained PostgreSQL and MongoDB data models supporting CRM, HR, and Inventory modules, optimizing queries for dashboards handling thousands of daily records.

**Full Stack Developer | Biztweak Pty Ltd, Johannesburg** — Feb 2023 – May 2023
- Improved MERN stack applications, UI responsiveness, and backend performance; enhanced Tailwind CSS interfaces and supported deployment pipelines.
- Collaborated with developers and stakeholders to deliver production-ready features, contributing to code quality, testing workflows, and stable releases.
- Refactored legacy Express.js endpoints to RESTful conventions, improving API consistency and reducing frontend integration bugs.
- Participated in daily stand-ups and sprint planning within an Agile team, consistently delivering tickets within sprint commitments.

**Intern, Full Stack Developer | Ata Hancer Bilisim Teknoloji Ltd, Mersin Turkey** — June 2021 – Aug 2021
- Built frontend modules, integrated backend APIs, and implemented secure authentication systems.
- Worked directly with senior engineers to debug production issues, gaining early exposure to real-world deployment processes.
- Contributed to internal tooling that streamlined the team's manual QA checklist into a semi-automated workflow.

### EDUCATION
B.Sc. in Computer Engineering | European University of Lefke 2018 – 2022

### CERTIFICATIONS & PROFESSIONAL MEMBERSHIPS
- React Developer Certification, HackerRank
- Agile Scrum Master, Skill Up
- Registered Candidate Engineering Technologist, ECSA

### LANGUAGES
English (Fluent) | Zulu (Native) | Turkish (Conversational)`;

const PLACEHOLDER_COVER = `# THABISO BLESSED NGULUBE
## Full Stack Software Engineer
## React • Next.js • Node.js • AWS • Docker • Django
>> 📍 Centurion, Gauteng
>> 📧 blessedngust13@gmail.com
>> 📞 +27 74 417 7166
>> 🔗 [LinkedIn](https://www.linkedin.com/in/thabiso-blessed/) | [GitHub](https://github.com/ThabisoBlessed) | [Portfolio](https://dynamic-folio-theta.vercel.app/blessedngust13)

Re: Application for {{Software Engineering role}}

Dear Hiring Manager's Name,

I'm a Full Stack Engineer building real-time, enterprise-grade systems across IoT, cloud infrastructure, and modern web applications. With 3+ years of hands-on experience delivering production systems using React, Node.js, Django, and AWS, I focus on building scalable solutions that directly impact business operations.

In my current role at Massive Group — a mining technology company — I have built and maintained enterprise applications covering IoT data pipelines, CRM, HR, inventory, and compliance workflows. I architected a real-time data processing system using Redis and MQTT that handles high-volume sensor streams from industrial equipment, and developed an automated PDF reporting engine integrated with the Telegram Bot API that eliminated hours of manual reporting per week.

I have strong experience integrating business-critical third-party APIs — including Xero for financial data synchronisation, Slack for automated team notifications, and ClickUp for workflow automation. On the frontend, I build scalable, maintainable UIs using React, Next.js, and Redux Toolkit, and I manage infrastructure using Docker and CI/CD pipelines for reliable deployments on AWS.

I am particularly drawn to {{[Company Name]}} because [insert a specific reason — e.g. 'your focus on data-driven enterprise solutions aligns directly with the work I am most passionate about']. I thrive in environments where technical challenges are real and the expectation is high-quality, production-ready software.

+++ Key highlights I bring to this role:
- 3+ years delivering scalable full-stack enterprise systems in production
- Real-time IoT pipeline experience with Redis, MQTT, and PLC integration
- API integration expertise: Xero, Slack, Telegram, ClickUp
- Modern frontend: React, Next.js, Redux Toolkit, TypeScript
- DevOps: Docker, AWS, CI/CD pipelines for production deployments
- ECSA Registered Candidate Engineering Technologist

I would welcome the opportunity to discuss how my background and skills can contribute to your team. I am available for an interview at your convenience and can provide references, code samples, or a portfolio walkthrough on request.

Thank you for your time and consideration.

Kind Regards,

**Thabiso Blessed Ngulube**
{{Full Stack Software Engineer}}
blessedngust13@gmail.com | +27 74 417 7166`;

function loadDoc(type: DocType): string {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem(STORAGE_PREFIX + type) ??
    (type === "cv" ? PLACEHOLDER_CV : PLACEHOLDER_COVER)
  );
}
function saveDoc(type: DocType, content: string) {
  localStorage.setItem(STORAGE_PREFIX + type, content);
}
function loadOriginal(type: DocType): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_PREFIX + type + "_original");
}
function saveOriginal(type: DocType, content: string) {
  localStorage.setItem(STORAGE_PREFIX + type + "_original", content);
}

// Pull the person's name out of the "# Name" line so the download
// filename / PDF title is dynamic per-user, not hardcoded.
function extractDocName(raw: string): string {
  const match = raw.match(/^#\s+(.+)$/m);
  const name = match?.[1]?.trim();
  return name && name.length > 0 ? name : "My CV";
}

// Escape HTML
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Inline markup: **bold**, [text](url), and {{accent text}}
function inline(s: string) {
  let out = esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  out = out.replace(/\{\{(.+?)\}\}/g, '<span class="accent">$1</span>');
  return out;
}

// Convert the simple markup language into styled HTML for the preview/print
function renderDoc(raw: string, type: DocType): string {
  const lines = raw.split("\n");
  let html = "";
  let inList = false;
  let para: string[] = [];
  let leftLines: string[] = [];
  let rightLines: string[] = [];
  let inHeader = type === "cover";
  let inHighlight = false;

  const flushPara = () => {
    if (para.length) {
      html += `<p>${para.map(inline).join("<br/>")}</p>`;
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };
  const closeHighlight = () => {
    if (inHighlight) {
      html += "</div>";
      inHighlight = false;
    }
  };
  const flushHeader = () => {
    if (!leftLines.length && !rightLines.length) return;
    html += `<div class="cover-header"><div class="cover-header-left">${leftLines.join("")}</div><div class="cover-header-right">${rightLines.map((l) => `<p class="contact-line">${l}</p>`).join("")}</div></div>`;
    leftLines = [];
    rightLines = [];
  };

  for (const lineRaw of lines) {
    const line = lineRaw.trimEnd();
    if (line.trim() === "") {
      closeList();
      flushPara();
      closeHighlight();
      // blank line ends the header block (for cover letters)
      if (inHeader && (leftLines.length || rightLines.length)) {
        flushHeader();
        inHeader = false;
      }
      continue;
    }
    if (line.startsWith("+++ ")) {
      closeList();
      flushPara();
      closeHighlight();
      if (inHeader) {
        flushHeader();
        inHeader = false;
      }
      html += `<div class="highlight-box"><p>${inline(line.slice(4))}</p>`;
      inHighlight = true;
    } else if (line.startsWith("# ")) {
      closeList();
      flushPara();
      closeHighlight();
      const piece = `<h1 class="doc-name">${inline(line.slice(2))}</h1>`;
      if (inHeader) leftLines.push(piece);
      else html += piece;
    } else if (line.startsWith("## ")) {
      closeList();
      flushPara();
      closeHighlight();
      const isSubtitle =
        inHeader && leftLines.some((l) => l.includes("doc-title"));
      const cls = isSubtitle ? "doc-subtitle" : "doc-title";
      const piece = `<p class="${cls}">${inline(line.slice(3))}</p>`;
      if (inHeader) leftLines.push(piece);
      else html += piece;
    } else if (line.startsWith("### ")) {
      closeList();
      flushPara();
      closeHighlight();
      if (inHeader) {
        flushHeader();
        inHeader = false;
      }
      html += `<div class="sec-title">${inline(line.slice(4))}</div>`;
    } else if (line.startsWith(">> ")) {
      closeList();
      flushPara();
      closeHighlight();
      if (inHeader) rightLines.push(inline(line.slice(3)));
    } else if (line.startsWith("> ")) {
      closeList();
      flushPara();
      closeHighlight();
      const piece = `<p class="doc-meta">${inline(line.slice(2))}</p>`;
      if (inHeader) leftLines.push(piece);
      else html += piece;
    } else if (line.startsWith("- ")) {
      flushPara();
      if (inHeader) {
        flushHeader();
        inHeader = false;
      }
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else {
      closeList();
      closeHighlight();
      if (inHeader) {
        flushHeader();
        inHeader = false;
      }
      para.push(line);
    }
  }
  closeList();
  flushPara();
  closeHighlight();
  flushHeader();
  return html;
}

export function AdminCVBuilderPanel() {
  const [active, setActive] = useState<DocType>("cv");
  const [content, setContent] = useState<Record<DocType, string>>({
    cv: "",
    cover: "",
  });
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent({ cv: loadDoc("cv"), cover: loadDoc("cover") });
  }, []);

  const updateContent = (type: DocType, value: string) => {
    setContent((prev) => ({ ...prev, [type]: value }));
    saveDoc(type, value);
  };

  const handleFile = async (file: File) => {
    setError("");
    setParsing(true);
    try {
      // pdfjs-dist must be installed: npm install pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      let extracted = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let lineText = "";
        for (const item of textContent.items as {
          str: string;
          transform: number[];
        }[]) {
          const y = item.transform[5];
          if (lastY !== null && Math.abs(y - lastY) > 2) {
            extracted += lineText.trim() + "\n";
            lineText = "";
          }
          lineText += item.str + " ";
          lastY = y;
        }
        extracted += lineText.trim() + "\n";
      }

      // Best-effort: wrap raw extracted text as a single editable block
      // with a note so the user/AI can quickly reformat using the markup
      // convention (#, ##, ###, >, -, **bold**).
      const guide =
        `<!-- Extracted from "${file.name}". Reformat using:\n` +
        `     # Name   ## Title   > Contact line   ### Section heading   - bullet   **bold** -->\n\n`;

      const formatted = guide + extracted.trim();
      updateContent(active, formatted);
      saveOriginal(active, formatted);
    } catch (e) {
      console.error(e);
      setError(
        "Couldn't read that PDF. Try a different file, or paste the text manually below.",
      );
    } finally {
      setParsing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleReset = () => {
    const original = loadOriginal(active);
    if (original) {
      updateContent(active, original);
    } else if (
      confirm("No uploaded original found. Reset to blank template?")
    ) {
      updateContent(
        active,
        active === "cv" ? PLACEHOLDER_CV : PLACEHOLDER_COVER,
      );
    }
  };

  const handleDownload = () => {
    // Dynamic PDF title/filename: most browsers use document.title as the
    // suggested filename in the "Save as PDF" dialog. Set it from whoever's
    // name is actually in the "# Name" line of the doc being printed, then
    // restore the page's real title afterwards.
    const personName = extractDocName(content[active]);
    const docLabel = active === "cv" ? "CV" : "Cover Letter";
    const printTitle = `${personName} - ${docLabel}`;

    const prevTitle = document.title;
    document.title = printTitle;

    const restore = () => {
      document.title = prevTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);

    window.print();
    setTimeout(restore, 2000);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setActive("cv")}
            className={`px-4 py-2 text-sm font-medium ${active === "cv" ? "bg-brand text-white" : "bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            CV
          </button>
          <button
            onClick={() => setActive("cover")}
            className={`px-4 py-2 text-sm font-medium border-l border-border ${active === "cover" ? "bg-brand text-white" : "bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            Cover Letter
          </button>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={parsing}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          {parsing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          Upload PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="hidden"
        />

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg bg-brand text-white hover:opacity-90 transition-opacity"
        >
          <Download size={14} />
          Download PDF
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {error && (
        <div className="mb-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1.5">
        <FileText size={13} className="mt-0.5 shrink-0" />
        Edit the text on the left using <code>#</code> for your name,{" "}
        <code>##</code> for the title line,
        <code>&gt;</code> for contact lines, <code>###</code> for section
        headings, <code>-</code> for bullets, and <code>**bold**</code> for
        emphasis. Paste AI-tailored text for any section, then download.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          className="w-full h-[70vh] text-sm font-mono p-4 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
          value={content[active]}
          onChange={(e) => updateContent(active, e.target.value)}
          spellCheck={false}
        />

        <div className="overflow-y-auto h-[70vh] rounded-xl border border-border bg-secondary/30 flex justify-center p-4">
          <div
            id="cv-print-area"
            className="cv-page"
            dangerouslySetInnerHTML={{
              __html: renderDoc(content[active], active),
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        .cv-page {
          background: #fff;
          color: #000;
          width: 210mm;
          min-height: 297mm;
          box-sizing: border-box;
          padding: 14mm 16mm;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 9.5pt;
          line-height: 1.28;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
          position: relative;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        .cv-page * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        .cv-page .cover-header {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          margin: 0 0 18px 0;
        }
        .cv-page .cover-header-left {
          background: #16284a;
          color: #fff;
          flex: 1.7;
          padding: 14px 18px;
        }
        .cv-page .cover-header-right {
          background: #1f3a63;
          color: #fff;
          flex: 1;
          padding: 14px 16px;
          border-left: 1px solid rgba(255, 255, 255, 0.18);
        }
        .cv-page .cover-header .doc-name {
          color: #fff;
          text-align: left;
          font-size: 15pt;
        }
        .cv-page .cover-header .doc-title {
          color: #dbe6f4;
          text-align: left;
          margin: 2px 0 4px;
        }
        .cv-page .cover-header .doc-subtitle {
          color: #9fb7d8;
          text-align: left;
          font-size: 8.5pt;
          font-style: italic;
          margin: 0 0 4px;
        }
        .cv-page .cover-header .doc-meta {
          color: #9fb7d8;
          text-align: left;
          font-style: italic;
          font-size: 8.5pt;
          margin: 0;
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        .cv-page .cover-header-right .contact-line {
          font-size: 8.5pt;
          margin: 0 0 4px;
          color: #fff;
        }
        .cv-page .cover-header-right .contact-line a {
          color: #fff;
          text-decoration: none;
        }
        .cv-page .cover-header + p {
          border-bottom: 1px solid #1f3a63;
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .cv-page .doc-name {
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          margin: 0;
        }
        .cv-page .doc-title {
          text-align: center;
          font-size: 10.5pt;
          margin: 2px 0 6px;
        }
        .cv-page .doc-meta {
          text-align: center;
          font-size: 9pt;
          color: #222;
          margin: 0 0 6px;
        }
        .cv-page .doc-meta:last-of-type {
          border-bottom: 1.5px solid #000;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .cv-page .sec-title {
          font-size: 10.5pt;
          font-weight: bold;
          border-bottom: 1px solid #000;
          margin: 10px 0 4px;
          padding-bottom: 2px;
          letter-spacing: 0.04em;
        }
        .cv-page p {
          margin: 0 0 4px;
        }
        .cv-page ul {
          list-style: disc !important;
          margin: 2px 0 8px 18px !important;
          padding: 0 0 0 1em !important;
        }
        .cv-page li {
          display: list-item !important;
          margin-bottom: 3px;
        }
        .cv-page a {
          color: #0c447c;
          text-decoration: none;
        }
        .cv-page .doc-meta a {
          color: #222;
          text-decoration: underline;
        }
        .cv-page .accent {
          color: #0c447c;
          font-weight: bold;
        }
        .cv-page .highlight-box {
          background: #eaf2fb;
          border-left: 4px solid #0c447c;
          border-radius: 4px;
          padding: 8px 12px 6px;
          margin: 8px 0;
        }
        .cv-page .highlight-box p {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .cv-page .highlight-box ul {
          margin: 0 0 0 1.2em !important;
        }

        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          #cv-print-area,
          #cv-print-area * {
            visibility: visible;
          }
          #cv-print-area {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            width: 210mm;
            min-height: 0;
            height: auto;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}