"use client";

import { useEffect, useState } from "react";
import { CONTENT_LABEL, type ContentType } from "@/lib/prompts";
import type { Result } from "./ResultCard";

export function ResultModal({
  type,
  data,
  onClose,
}: {
  type: ContentType | null;
  data: Result | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  if (!data || !type) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(`${data.title}\n\n${data.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel my-8 w-[min(92vw,820px)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <span className={`badge ${type}`}>{CONTENT_LABEL[type]}</span>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-md p-1 text-white/70 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">
          <h2 className="mb-4 text-xl font-bold leading-snug text-white">
            {data.title}
          </h2>
          <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-white/85">
            {data.content}
          </pre>
        </div>
        <div className="flex justify-end border-t border-white/10 px-6 py-4">
          <button className="btn-primary" onClick={copy}>
            {copied ? "Copied!" : "コピーする"}
          </button>
        </div>
      </div>
    </div>
  );
}
