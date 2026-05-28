"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_COLORS: Record<string, string> = {
  typescript: "#3178c6", javascript: "#f7df1e", python: "#3572A5",
  rust: "#dea584", go: "#00ADD8", java: "#b07219", css: "#563d7c",
  html: "#e34c26", sql: "#e38c00", bash: "#89e051", other: "#8b8b8b",
};

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  className?: string;
}

export function CodeBlock({ code, language, title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const color = LANG_COLORS[language.toLowerCase()] || LANG_COLORS.other;

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {title || language}
          </span>
        </div>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 bg-background overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
