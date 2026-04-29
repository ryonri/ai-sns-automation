"use client";

import { CONTENT_LABEL, type ContentType } from "@/lib/prompts";

export type Result = { title: string; content: string };

export function ResultCard({
  type,
  data,
  loading,
  error,
  onExpand,
}: {
  type: ContentType;
  data: Result | null;
  loading: boolean;
  error?: string | null;
  onExpand: (data: Result, type: ContentType) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => data && onExpand(data, type)}
      className="glass-panel p-5 text-left transition hover:-translate-y-0.5 hover:border-white/20 disabled:cursor-default"
      disabled={!data}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className={`badge ${type}`}>{CONTENT_LABEL[type]}</span>
        {data && <span className="text-xs text-white/50">クリックで全文</span>}
      </div>
      <div className="min-h-[140px]">
        {loading ? (
          <div className="grid h-32 place-items-center">
            <div className="spinner" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : data ? (
          <>
            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-white">
              {data.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
              {data.content.length > 140
                ? data.content.slice(0, 140).trim() + "…"
                : data.content}
            </p>
          </>
        ) : (
          <p className="text-sm text-white/45">
            コンセプトを入力して
            <br />
            生成ボタンを押してください
          </p>
        )}
      </div>
    </button>
  );
}
