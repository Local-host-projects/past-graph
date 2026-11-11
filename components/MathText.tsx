"use client";

import katex from "katex";

export function renderSegments(s: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const parts = s.split(/(\$[^$]+\$)/g);
  parts.forEach((part, i) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      const tex = part.slice(1, -1);
      try {
        out.push(
          <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false }) }} />
        );
      } catch {
        out.push(<span key={i}>{part}</span>);
      }
    } else if (part) {
      out.push(<span key={i}>{part}</span>);
    }
  });
  return out;
}

export default function MathText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderSegments(text)}</span>;
}
