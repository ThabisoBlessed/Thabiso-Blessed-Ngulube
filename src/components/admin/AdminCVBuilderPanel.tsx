"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, RotateCcw, FileText, Loader2 } from "lucide-react";
// Add to imports
import { Copy, Check } from "lucide-react";

type DocType = "cv" | "cover";

const STORAGE_PREFIX = "cvbuilder_v1_";

const PLACEHOLDER_CV = `# THABISO BLESSED NGULUBE
## Lead Software Engineer | Cloud-Native & IoT Systems | Enterprise Platform Architecture
> Centurion, Gauteng | blessedngust13@gmail.com | +27 74 417 7166 | [LinkedIn](https://www.linkedin.com/in/thabiso-blessed/) | [GitHub](https://github.com/ThabisoBlessed) | [Portfolio](https://thabiso-blessed-ngulube.vercel.app)

### PROFESSIONAL SUMMARY
Lead Software Engineer at Massive Group Pty Ltd, a mining technology company serving the coal mining industry, building enterprise-grade web and mobile applications with a strong focus on real-time IoT systems, data pipelines, and cloud-native architectures. Built an automated reporting pipeline that eliminated 12+ hours of manual report compilation per week across 40+ mine sites, moving control rooms from reactive reporting to proactive client service, and is now sold as a monetised feature of the company's client offering. Proven ability to design real-time data pipelines, integrate third-party APIs, and deploy scalable cloud solutions using AWS, Docker, and CI/CD. Recently applied the same approach to LLM tooling, building a tool-calling AI agent that answers operational questions from live production data.

### KEY PROJECTS
**Automated Reporting Engine** — Automated hourly, shift, and event-based reporting (PDF and Telegram bot) that was previously compiled manually for about 40 sites, saving 12+ hours of work per week. Control rooms no longer spend time compiling reports and can now act proactively on client requests. Deployed across 40+ mine sites and sold as a monetised feature of the company's client offering.

**IoT Telemetry Platform** — Designed a real-time PLC data pipeline using MQTT and Redis, turning high-volume sensor streams from mining equipment into live dashboards, so field operations teams can monitor production as it happens rather than after the fact.

**Cross-Platform Field App** — Shipped a React Native inspections app syncing with the CRM/Inventory backend, replacing manual inspection capture for on-site technicians across multiple sites, used daily.

**MineOps AI** — Built a tool-calling LLM agent (FastAPI, Pydantic v2, PostgreSQL) that answers plain-English questions about live production data, so non-technical staff get grounded answers instantly instead of waiting on a manual report.

### TECHNICAL SKILLS
- **Frontend:** React, Next.js, React Native, Angular, Tailwind CSS, HTML5, CSS3, TypeScript, JavaScript
- **Backend:** Node.js, Express.js, Python, FastAPI, Pydantic v2, Django, Flask, Redis, MQTT
- **AI / LLM:** OpenAI API, Ollama, LLM tool-calling / function-calling agent design, provider-agnostic model gateway architecture
- **Cloud & DevOps:** AWS (EC2, Lambda, S3, DynamoDB, Amplify, Rekognition), Digital Ocean (Managed Databases), Docker, CI/CD, Linux
- **Databases:** PostgreSQL (raw SQL, query optimization, connection pooling), MySQL, MongoDB, DynamoDB
- **APIs & Integrations:** Xero, ClickUp, Slack, Telegram, RESTful APIs, Real-Time Data Services
- **Testing & Tools:** Pytest, Jest, Postman, Git

### PROFESSIONAL EXPERIENCE
**Lead Software Engineer | Massive Group Pty Ltd, Centurion** — June 2023 – Present
*Industry: Coal mining technology — real-time production monitoring and reporting for mining operations*
- Led development and owned architecture of enterprise platforms across CRM, HR, Inventory, Inspections, LMS, and IoT workflows, collaborating with cross-functional teams in the mining technology sector.
- Automated hourly, shift, and event-based site reporting that was previously compiled manually for about 40 sites, eliminating 12+ hours of manual work per week. This freed control rooms to respond proactively to client requests instead of reactively. Rolled out across 40+ mine sites and sold as a monetised feature of the department's client offering.
- Diagnosed and fixed a recurring database performance issue causing intermittent report failures across multiple sites, tracing it to an index-order mismatch and uncoordinated query concurrency. Restored reliable reporting at every affected site without a database migration.
- Built React Native mobile apps and Next.js dashboards giving field teams real-time KPI reporting and operational visibility.
- Designed IoT data pipelines using Redis, MQTT, and FastAPI to process PLC telemetry into live production figures.
- Integrated Xero, ClickUp, Slack, and Telegram APIs to automate manual workflows, and built PDF reporting engines with real-time data delivery.
- Deployed containerized microservices with Docker and CI/CD pipelines, improving deployment reliability and reducing release friction across multiple services.
- Designed and maintained PostgreSQL and MongoDB data models supporting CRM, HR, and Inventory modules, optimizing queries for dashboards handling thousands of daily records.

**Full Stack Developer | Biztweak Pty Ltd, Johannesburg** — Feb 2023 – May 2023
*Industry: Enterprise SaaS / entrepreneurship and SME development — assessment and data platform used by enterprise and supplier development programs*
- Improved the MERN stack SaaS platform's UI responsiveness and backend performance, supporting the assessments and reporting that development programs use to track small-business beneficiaries.
- Refactored legacy Express.js endpoints to RESTful conventions, improving API consistency and reducing frontend integration bugs.
- Enhanced Tailwind CSS interfaces and supported deployment pipelines, contributing to code quality, testing workflows, and stable production releases.
- Worked in an Agile team (daily stand-ups, sprint planning), consistently delivering tickets within sprint commitments.

**Intern, Full Stack Developer | Ata Hancer Bilisim Teknoloji Ltd, Mersin Turkey** — June 2021 – Aug 2021
*Industry: Digital agency — web design, software development, and mobile applications for business clients*
- Built frontend modules, integrated backend APIs, and implemented secure authentication systems for client projects.
- Worked directly with senior engineers to debug production issues, gaining early exposure to real-world deployment processes.
- Contributed to internal tooling that turned the team's manual QA checklist into a semi-automated workflow.

### EDUCATION
B.Sc. in Computer Engineering | European University of Lefke 2018 – 2022

### CERTIFICATIONS & PROFESSIONAL MEMBERSHIPS
- React Developer Certification, HackerRank
- Agile Scrum Master, Skill Up
- Registered Candidate Engineering Technologist, ECSA

### INTERESTS
- Open-source contributions
- IoT & embedded systems
- Cloud architecture design
- Mentoring junior developers

### LANGUAGES
- English (Fluent)
- Zulu (Native)
- Turkish (Conversational)`;

const PLACEHOLDER_COVER = `# THABISO BLESSED NGULUBE
## Lead Software Engineer
## React • Next.js • Node.js • Python • AWS • Docker
>> 📍 Centurion, Gauteng
>> 📧 blessedngust13@gmail.com
>> 📞 +27 74 417 7166
>> 🔗 [LinkedIn](https://www.linkedin.com/in/thabiso-blessed/) | [GitHub](https://github.com/ThabisoBlessed) | [Portfolio](https://thabiso-blessed-ngulube.vercel.app)

Dear Hiring Manager,

I'm a Lead Software Engineer at Massive Group, a mining technology company serving the coal mining industry. I build real-time systems that turn plant and sensor data into reports and dashboards operations teams can act on, and I own the architecture of our enterprise platforms across IoT, CRM, HR, inventory, and inspections.

My most measurable result is an automated reporting engine. Hourly, shift, and event-based reports for about 40 sites were compiled by hand, which took more than 12 hours every week. I automated the whole process, with delivery by PDF and Telegram bot, and it now runs across 40+ mine sites and is sold as a monetised feature of our client offering. The bigger win is where that time went: control rooms no longer spend their shifts compiling reports, so they can respond to client requests proactively instead of reactively.

I also fix what costs reliability. When intermittent report failures hit several sites, I traced them to an index-order mismatch and uncoordinated query concurrency in PostgreSQL and resolved them without a database migration. I designed a real-time PLC telemetry pipeline (MQTT, Redis, FastAPI) that feeds live production dashboards, and shipped a React Native inspections app that on-site technicians use daily. Most recently I built MineOps AI, a tool-calling LLM agent (FastAPI, Pydantic v2, PostgreSQL) that lets non-technical staff ask plain-English questions about live production data and get grounded answers without waiting for a manual report.

My background is full stack: React, Next.js, and Node.js on the front end, Python with Django and FastAPI on the back end, Docker and CI/CD on AWS for deployment, and integrations with Xero, ClickUp, Slack, and Telegram. Earlier roles at Biztweak, an enterprise SaaS platform for SME development programmes, and at a digital agency gave me a grounding in Agile delivery.

I'm drawn to organisations solving real operational problems with technology, and I thrive where the technical challenges are substantial and the expectation is high-quality, production-ready software. I'd welcome the chance to bring that same ownership and technical depth to a new team.

+++ Key results I bring to this role:
- 12+ hours of manual reporting removed every week by automating reports for about 40 sites
- Reporting deployed across 40+ mine sites and sold as a monetised client feature
- Control rooms moved from reactive reporting to proactive client service
- Recurring cross-site report failures fixed without a database migration
- Real-time PLC telemetry pipeline (MQTT, Redis, FastAPI) feeding live production dashboards
- LLM tool-calling agent giving non-technical staff instant, grounded answers from live data
- Full stack delivery: React, Next.js, React Native, Node.js, Python, Docker, AWS, CI/CD
- ECSA Registered Candidate Engineering Technologist

I would welcome the opportunity to discuss how my background can contribute to your team. I am available for an interview at your convenience and can provide references, code samples, or a portfolio walkthrough on request.

Thank you for your time and consideration.

Kind Regards,

**Thabiso Blessed Ngulube**
Lead Software Engineer
blessedngust13@gmail.com | +27 74 417 7166`;

const CONTENT_VERSION = "v7";

function loadDoc(type: DocType): string {
  if (typeof window === "undefined") return "";
  const storedVersion = localStorage.getItem(STORAGE_PREFIX + "version");
  if (storedVersion !== CONTENT_VERSION) {
    localStorage.removeItem(STORAGE_PREFIX + "cv");
    localStorage.removeItem(STORAGE_PREFIX + "cover");
    localStorage.removeItem(STORAGE_PREFIX + "cv_original");
    localStorage.removeItem(STORAGE_PREFIX + "cover_original");
    localStorage.setItem(STORAGE_PREFIX + "version", CONTENT_VERSION);
  }
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

// Format a name for use as a download filename / PDF title:
// title-case each word, shorten middle name(s) to a single initial,
// e.g. "THABISO BLESSED NGULUBE" -> "Thabiso B Ngulube".
function formatNameForFilename(raw: string): string {
  const words = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
  if (words.length <= 2) return words.join(" ");
  const first = words[0];
  const last = words[words.length - 1];
  const middleInitials = words.slice(1, -1).map((w) => w[0]);
  return [first, ...middleInitials, last].join(" ");
}

// Escape HTML
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Inline markup: **bold**, *italic*, [text](url), and {{accent text}}
function inline(s: string) {
  let out = esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  out = out.replace(/\{\{(.+?)\}\}/g, '<span class="accent">$1</span>');
  return out;
}

const SIDEBAR_KEYWORDS = [
  "SKILL",
  "EDUCATION",
  "CERTIF",
  "LANGUAGE",
  "TRAINING",
  "COURSE",
  "INTEREST",
  "AWARD",
  "ACHIEVEMENT",
];

function isSidebarSection(title: string): boolean {
  const t = title.toUpperCase();
  return SIDEBAR_KEYWORDS.some((k) => t.includes(k));
}

// Render a block of body lines (paragraphs / bullets / highlight boxes) with
// no header or section-title handling — used per-section inside the
// two-column CV layout below.
function renderBodyLines(lines: string[]): string {
  let html = "";
  let inList = false;
  let para: string[] = [];
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
  for (const lineRaw of lines) {
    const line = lineRaw.trimEnd();
    if (line.trim() === "") {
      closeList();
      flushPara();
      closeHighlight();
      continue;
    }
    if (line.startsWith("+++ ")) {
      closeList();
      flushPara();
      closeHighlight();
      html += `<div class="highlight-box"><p>${inline(line.slice(4))}</p>`;
      inHighlight = true;
    } else if (line.startsWith("- ")) {
      flushPara();
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else {
      closeList();
      closeHighlight();
      para.push(line);
    }
  }
  closeList();
  flushPara();
  closeHighlight();
  return html;
}

// Two-column CV layout: a name/title/contact banner up top, then a wide
// "main" column (summary + experience) beside a narrower "side" column
// (skills / education / certifications / languages) — a classic modern
// resume format.
function renderCV(raw: string): string {
  const lines = raw.split("\n");
  let i = 0;
  let nameLine = "";
  let titleLine = "";
  const metaLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (line.startsWith("### ")) break;
    if (line.startsWith("# ")) nameLine = line.slice(2);
    else if (line.startsWith("## ")) titleLine = line.slice(3);
    else if (line.startsWith("> ")) metaLines.push(line.slice(2));
    i++;
  }

  const headerHtml = `<div class="cv2-header">
    <h1 class="cv2-name">${inline(nameLine)}</h1>
    ${titleLine ? `<p class="cv2-title">${inline(titleLine)}</p>` : ""}
    ${metaLines.length ? `<p class="cv2-meta">${metaLines.map(inline).join(" &nbsp;|&nbsp; ")}</p>` : ""}
  </div>`;

  type Section = { title: string; body: string };
  const sections: Section[] = [];
  let curTitle = "";
  let curLines: string[] = [];
  const pushSection = () => {
    if (curTitle)
      sections.push({ title: curTitle, body: renderBodyLines(curLines) });
    curLines = [];
  };
  for (; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (line.startsWith("### ")) {
      pushSection();
      curTitle = line.slice(4);
    } else {
      curLines.push(line);
    }
  }
  pushSection();

  const mainSections = sections.filter((s) => !isSidebarSection(s.title));
  const sideSections = sections.filter((s) => isSidebarSection(s.title));

  const renderCol = (list: Section[]) =>
    list
      .map(
        (s) =>
          `<div class="cv2-section"><div class="cv2-sec-title">${inline(s.title)}</div>${s.body}</div>`,
      )
      .join("");

  return `${headerHtml}<div class="cv2-body"><div class="cv2-main">${renderCol(mainSections)}</div><div class="cv2-side">${renderCol(sideSections)}</div></div>`;
}

// Convert the simple markup language into styled HTML for the preview/print
function renderDoc(raw: string, type: DocType): string {
  if (type === "cv") return renderCV(raw);
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

// ═══════════════════════════════════════════════════════════════════════════
//  CV LAYOUT: the knobs you can turn. Change a number, save, and both the
//  preview and the downloaded PDF follow (they share these values).
//  Sizes: pt = print points, px = pixels, mm = millimetres.
//  Tip: the CV is auto-shrunk to fit ONE page. If text looks squinted, make
//  the content shorter or the numbers below smaller, rather than relying on
//  the shrink. "Page fit" under the toolbar shows how much it is shrinking.
// ═══════════════════════════════════════════════════════════════════════════
const CV_LAYOUT = {
  // Auto-fit
  minScale: 0.55,            // shrink floor. Raise (e.g. 0.8) to stop tiny text; content is clipped instead
  // Page margins (applies to CV and cover letter)
  padTopBottomMm: 8,         // top/bottom margin. Less = more room, but keep >= 6 for printers
  padSideMm: 10,             // left/right margin
  // Body text (base size also drives the cover letter)
  fontPt: 9.5,               // base text size
  lineHeight: 1.28,          // line spacing, 1.2 tight, 1.4 airy
  bulletFontPt: 9,           // bullets in the wide (main) column
  sideBulletFontPt: 8.5,     // bullets in the narrow (side) column
  // Header
  nameFontPt: 19,
  titleFontPt: 10.5,
  metaFontPt: 8.5,           // contact line
  // Section headings
  sectionTitlePt: 9.5,       // main column
  sideSectionTitlePt: 8.5,   // side column
  // Columns
  columnGapPx: 20,           // space between main and side column
  mainColumnWeight: 1.62,    // main : side width ratio. Raise main to give experience more room
  sideColumnWeight: 1,
  // Vertical rhythm (the main way to trade space for density)
  sectionGapPx: 12,          // space between sections
  bulletGapPx: 3,            // space between bullets
  paragraphGapPx: 4,         // space after paragraphs
} as const;

// Exposed to the CSS as custom properties (--cv-*), so the preview and the
// print stylesheet below read the same numbers.
const CV_VARS: Record<string, string> = {
  "--cv-pad": `${CV_LAYOUT.padTopBottomMm}mm ${CV_LAYOUT.padSideMm}mm`,
  "--cv-font": `${CV_LAYOUT.fontPt}pt`,
  "--cv-line": `${CV_LAYOUT.lineHeight}`,
  "--cv-li": `${CV_LAYOUT.bulletFontPt}pt`,
  "--cv-side-li": `${CV_LAYOUT.sideBulletFontPt}pt`,
  "--cv-name": `${CV_LAYOUT.nameFontPt}pt`,
  "--cv-title": `${CV_LAYOUT.titleFontPt}pt`,
  "--cv-meta": `${CV_LAYOUT.metaFontPt}pt`,
  "--cv-sec-title": `${CV_LAYOUT.sectionTitlePt}pt`,
  "--cv-side-sec-title": `${CV_LAYOUT.sideSectionTitlePt}pt`,
  "--cv-col-gap": `${CV_LAYOUT.columnGapPx}px`,
  "--cv-main-flex": `${CV_LAYOUT.mainColumnWeight}`,
  "--cv-side-flex": `${CV_LAYOUT.sideColumnWeight}`,
  "--cv-section-gap": `${CV_LAYOUT.sectionGapPx}px`,
  "--cv-li-gap": `${CV_LAYOUT.bulletGapPx}px`,
  "--cv-p-gap": `${CV_LAYOUT.paragraphGapPx}px`,
};
const CV_VARS_CSS = Object.entries(CV_VARS)
  .map(([k, v]) => `${k}: ${v};`)
  .join(" ");

// A4 is 297mm tall (≈1122.5px at 96dpi); the content box is that minus the
// top and bottom margin.
const PAGE_CONTENT_HEIGHT_PX = ((297 - 2 * CV_LAYOUT.padTopBottomMm) * 96) / 25.4;

// Plain-string duplicate of the core .cv-page rules below, used to build a
// fully standalone print document (see handleDownload). Keep this in sync
// with the <style jsx global> block near the bottom of this file if you
// change the CV's visual styling.
const PRINT_CSS = `
  html, body { margin: 0; padding: 0; background: #fff; }
  @page { margin: 0; size: A4; }
  .cv-page {
    ${CV_VARS_CSS}
    background: #fff;
    color: #000;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    box-sizing: border-box;
    padding: var(--cv-pad);
    font-family: Arial, Helvetica, sans-serif;
    font-size: var(--cv-font);
    line-height: var(--cv-line);
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
  .cv-page-inner { transform-origin: top left; }
  .cv-page .cover-header { display: flex; border-radius: 8px; overflow: hidden; margin: 0 0 18px 0; }
  .cv-page .cover-header-left { background: #16284a; color: #fff; flex: 1.7; padding: 14px 18px; }
  .cv-page .cover-header-right { background: #1f3a63; color: #fff; flex: 1; padding: 14px 16px; border-left: 1px solid rgba(255,255,255,0.18); }
  .cv-page .cover-header .doc-name { color: #fff; text-align: left; font-size: 15pt; }
  .cv-page .cover-header .doc-title { color: #dbe6f4; text-align: left; margin: 2px 0 4px; }
  .cv-page .cover-header .doc-subtitle { color: #9fb7d8; text-align: left; font-size: 8.5pt; font-style: italic; margin: 0 0 4px; }
  .cv-page .cover-header .doc-meta { color: #9fb7d8; text-align: left; font-style: italic; font-size: 8.5pt; margin: 0; border-bottom: none; padding-bottom: 0; }
  .cv-page .cover-header-right .contact-line { font-size: 8.5pt; margin: 0 0 4px; color: #fff; }
  .cv-page .cover-header-right .contact-line a { color: #fff; text-decoration: none; }
  .cv-page .cover-header + p { border-bottom: 1px solid #1f3a63; padding-bottom: 8px; margin-bottom: 10px; }
  .cv-page .cv2-header { border-bottom: 2px solid #16284a; padding-bottom: 10px; margin-bottom: 14px; }
  .cv-page .cv2-name { font-size: var(--cv-name); font-weight: bold; margin: 0; color: #16284a; letter-spacing: 0.02em; }
  .cv-page .cv2-title { font-size: var(--cv-title); font-weight: 600; color: #0c447c; margin: 3px 0 6px; text-transform: uppercase; letter-spacing: 0.03em; }
  .cv-page .cv2-meta { font-size: var(--cv-meta); color: #444; margin: 0; }
  .cv-page .cv2-meta a { color: #444; text-decoration: underline; }
  .cv-page .cv2-body { display: flex; gap: var(--cv-col-gap); align-items: stretch; }
  .cv-page .cv2-main { flex: var(--cv-main-flex); min-width: 0; }
  .cv-page .cv2-side { flex: var(--cv-side-flex); min-width: 0; border-left: 1px solid #d8dee8; padding-left: 16px; }
  .cv-page .cv2-section { margin-bottom: var(--cv-section-gap); page-break-inside: avoid; break-inside: avoid; }
  .cv-page .cv2-sec-title { font-size: var(--cv-sec-title); font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #16284a; border-bottom: 1.5px solid #16284a; padding-bottom: 3px; margin-bottom: 6px; }
  .cv-page .cv2-side .cv2-sec-title { font-size: var(--cv-side-sec-title); }
  .cv-page .cv2-body p { margin: 0 0 var(--cv-p-gap); }
  .cv-page .cv2-body ul { list-style: disc; margin: 2px 0 6px 16px; padding: 0 0 0 1em; }
  .cv-page .cv2-body li { display: list-item; margin-bottom: var(--cv-li-gap); font-size: var(--cv-li); }
  .cv-page .cv2-side li { font-size: var(--cv-side-li); }
  .cv-page .doc-name { font-size: 16pt; font-weight: bold; text-align: center; margin: 0; }
  .cv-page .doc-title { text-align: center; font-size: 10.5pt; margin: 2px 0 6px; }
  .cv-page .doc-meta { text-align: center; font-size: 9pt; color: #222; margin: 0 0 6px; }
  .cv-page .doc-meta:last-of-type { border-bottom: 1.5px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
  .cv-page .sec-title { font-size: 10.5pt; font-weight: bold; border-bottom: 1px solid #000; margin: 10px 0 4px; padding-bottom: 2px; letter-spacing: 0.04em; }
  .cv-page p { margin: 0 0 4px; }
  .cv-page ul { list-style: disc; margin: 2px 0 8px 18px; padding: 0 0 0 1em; }
  .cv-page li { display: list-item; margin-bottom: 3px; }
  .cv-page a { color: #0c447c; text-decoration: none; }
  .cv-page .doc-meta a { color: #222; text-decoration: underline; }
  .cv-page .accent { color: #0c447c; font-weight: bold; }
  .cv-page .highlight-box { background: #eaf2fb; border-left: 4px solid #0c447c; border-radius: 4px; padding: 8px 12px 6px; margin: 8px 0; }
  .cv-page .highlight-box p { font-weight: bold; margin-bottom: 4px; }
  .cv-page .highlight-box ul { margin: 0 0 0 1.2em; }
`;

export function AdminCVBuilderPanel() {
  const [active, setActive] = useState<DocType>("cv");
  const [content, setContent] = useState<Record<DocType, string>>({
    cv: "",
    cover: "",
  });
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [overflow, setOverflow] = useState(false);
  // Add to component state
  const [copied, setCopied] = useState(false);
  const promptText =
    "Update this CV markdown and return it as markdown — same format, no PDF/DOCX file, just the raw markdown text in the chat that I can copy and paste into my CV generator. Don't create any files or use file tools unless I explicitly ask for a PDF or Word doc.";

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    setContent({ cv: loadDoc("cv"), cover: loadDoc("cover") });
  }, []);

  // Auto-fit to ONE A4 page. We find the largest scale that fits by trying
  // candidates at their REAL final width (width = 100/scale %). The old version
  // measured at full size, shrank, then widened the box, so the text re-flowed
  // into fewer lines than measured: it shrank too much (squinting) and left
  // white space under the content.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const fits = (sc: number) => {
      el.style.transform = `scale(${sc})`;
      el.style.width = `${100 / sc}%`;
      return el.scrollHeight * sc <= PAGE_CONTENT_HEIGHT_PX;
    };

    const floor: number = CV_LAYOUT.minScale;
    let best = 1;
    let overflow = false;
    if (!fits(1)) {
      if (!fits(floor)) {
        best = floor;      // still too long at the floor: clipped at the bottom
        overflow = true;
      } else {
        let lo = floor;
        let hi = 1;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid; else hi = mid;
        }
        best = lo;
      }
    }
    best = Math.floor(best * 1000) / 1000;
    // Leave the DOM on the chosen scale (the probes above overwrote it).
    el.style.transform = `scale(${best})`;
    el.style.width = best < 1 ? `${100 / best}%` : "100%";
    setScale(best);
    setOverflow(overflow);
  }, [content, active]);

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
    // Print via a hidden, fully isolated iframe instead of window.print()
    // on the whole app page. This is what actually fixes the "looks like
    // 1 page on screen but prints as 2" bug: window.print() hands control
    // to the browser's print engine along with the ENTIRE app's CSS/DOM,
    // and the browser's own print margins/scaling can override our layout
    // in ways we don't control. An iframe containing ONLY the CV markup
    // and its own minimal stylesheet gives the print engine nothing else
    // to react to, so our fixed 210mm x 297mm box prints exactly as shown.
    const personName = formatNameForFilename(extractDocName(content[active]));
    const docLabel = active === "cv" ? "Cv" : "Cover Letter";
    const bodyHtml = renderDoc(content[active], active);
    const widthStyle = scale < 1 ? `${100 / scale}%` : "100%";

    const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${personName}_${docLabel}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
<div class="cv-page"><div class="cv-page-inner" style="transform: scale(${scale}); width: ${widthStyle};">${bodyHtml}</div></div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      setError("Couldn't open the print window. Please try again.");
      return;
    }
    iframeDoc.open();
    iframeDoc.write(doc);
    iframeDoc.close();

    // Browsers derive the suggested "Save as PDF" filename from the
    // TOP-LEVEL page's document.title, not the iframe's <title> — even
    // though it's the iframe that's actually printing. So we swap the
    // real page title out for the duration of the print call and put
    // it back right after.
    const originalTitle = document.title;
    document.title = `${personName}_${docLabel}`;

    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
      document.title = originalTitle;
    };

    iframe.onload = () => {
      // small delay so the iframe has fully laid out before printing
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(cleanup, 1000);
      }, 150);
    };
  };

  return (
    <div>
      <div className="relative mb-4 rounded-xl border border-border bg-secondary/40 p-3 pr-20">
        <p className="text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {promptText}
        </p>
        <button
          onClick={handleCopyPrompt}
          className="absolute top-2 right-2 cursor-pointer flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium hover:bg-secondary transition-colors"
        >
          {copied ? (
            <Check size={12} className="text-green-600" />
          ) : (
            <Copy size={12} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setActive("cv")}
            className={`px-4 py-2 text-sm cursor-pointer font-medium ${active === "cv" ? "bg-brand text-white" : "bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            CV
          </button>
          <button
            onClick={() => setActive("cover")}
            className={`px-4 py-2 text-sm cursor-pointer font-medium border-l border-border ${active === "cover" ? "bg-brand text-white" : "bg-card text-muted-foreground hover:bg-secondary"}`}
          >
            Cover Letter
          </button>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={parsing}
          className="flex items-center gap-1.5  cursor-pointer text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
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
          className="flex items-center gap-1.5  cursor-pointer text-sm font-semibold px-3 py-2 rounded-lg bg-brand text-white hover:opacity-90 transition-opacity"
        >
          <Download size={14} />
          Download PDF
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5  cursor-pointer text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
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

      <p className={`text-xs mb-3 ${overflow ? "text-destructive" : "text-muted-foreground"}`}>
        Page fit: {Math.round(scale * 100)}%
        {overflow
          ? " · too long even at the minimum size, so the bottom is cut off. Shorten the text or lower the sizes in CV_LAYOUT."
          : scale < 1
            ? " · shrunk to fit one page. Below about 85% the text starts to look small."
            : " · fits at full size."}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          className="w-full h-[70vh] text-sm font-mono p-4 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
          value={content[active]}
          onChange={(e) => updateContent(active, e.target.value)}
          spellCheck={false}
        />

        <div className="overflow-y-auto h-[70vh] rounded-xl border border-border bg-secondary/30 flex justify-center p-4">
          <div id="cv-print-area" className="cv-page" style={CV_VARS as React.CSSProperties}>
            <div
              ref={innerRef}
              className="cv-page-inner"
              style={{
                transform: `scale(${scale})`,
                width: scale < 1 ? `${100 / scale}%` : "100%",
              }}
              dangerouslySetInnerHTML={{
                __html: renderDoc(content[active], active),
              }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .cv-page {
          background: #fff;
          color: #000;
          width: 210mm;
          height: 297mm;
          overflow: hidden;
          box-sizing: border-box;
          padding: var(--cv-pad);
          font-family: Arial, Helvetica, sans-serif;
          font-size: var(--cv-font);
          line-height: var(--cv-line);
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
        .cv-page-inner {
          transform-origin: top left;
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
        .cv-page .cv2-header {
          border-bottom: 2px solid #16284a;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .cv-page .cv2-name {
          font-size: var(--cv-name);
          font-weight: bold;
          margin: 0;
          color: #16284a;
          letter-spacing: 0.02em;
        }
        .cv-page .cv2-title {
          font-size: var(--cv-title);
          font-weight: 600;
          color: #0c447c;
          margin: 3px 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .cv-page .cv2-meta {
          font-size: var(--cv-meta);
          color: #444;
          margin: 0;
        }
        .cv-page .cv2-meta a {
          color: #444;
          text-decoration: underline;
        }
        .cv-page .cv2-body {
          display: flex;
          gap: var(--cv-col-gap);
          align-items: stretch;
        }
        .cv-page .cv2-main {
          flex: var(--cv-main-flex);
          min-width: 0;
        }
        .cv-page .cv2-side {
          flex: var(--cv-side-flex);
          min-width: 0;
          border-left: 1px solid #d8dee8;
          padding-left: 16px;
        }
        .cv-page .cv2-section {
          margin-bottom: var(--cv-section-gap);
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .cv-page .cv2-sec-title {
          font-size: var(--cv-sec-title);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #16284a;
          border-bottom: 1.5px solid #16284a;
          padding-bottom: 3px;
          margin-bottom: 6px;
        }
        .cv-page .cv2-side .cv2-sec-title {
          font-size: var(--cv-side-sec-title);
        }
        .cv-page .cv2-body p {
          margin: 0 0 var(--cv-p-gap);
        }
        .cv-page .cv2-body ul {
          list-style: disc !important;
          margin: 2px 0 6px 16px !important;
          padding: 0 0 0 1em !important;
        }
        .cv-page .cv2-body li {
          display: list-item !important;
          margin-bottom: var(--cv-li-gap);
          font-size: var(--cv-li);
        }
        .cv-page .cv2-side li {
          font-size: var(--cv-side-li);
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
            height: 297mm;
            overflow: hidden;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}