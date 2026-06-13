"use client";

import { useEffect, useState } from "react";
import { ApiKeyDialog, useOpenAiKey } from "@/components/ApiKeyDialog";
import { ResultCard, type Result } from "@/components/ResultCard";
import { ResultModal } from "@/components/ResultModal";
import { CONTENT_TYPES, type ContentType } from "@/lib/prompts";

type Slot = { data: Result | null; error: string | null };
type SnsContextPayload = {
  theme?: string;
  skills?: string;
  profile?: string;
  audience?: string;
};

const EMPTY: Record<ContentType, Slot> = {
  note: { data: null, error: null },
  melmaga: { data: null, error: null },
  x: { data: null, error: null },
  threads: { data: null, error: null },
};

export default function Page() {
  const { key, save } = useOpenAiKey();
  const [keyOpen, setKeyOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<Record<ContentType, Slot>>(EMPTY);
  const [modal, setModal] = useState<{ data: Result; type: ContentType } | null>(null);

  useEffect(() => {
    const allowedOrigins = new Set([
      "https://click-design.vercel.app",
      "https://mob-online.com",
      "https://www.mob-online.com",
      "http://localhost:3000",
      "http://localhost:8080",
    ]);

    const composeConcept = (payload: SnsContextPayload) => {
      const lines = [
        payload.theme?.trim() ? `ナレッジ・テーマ:\n${payload.theme.trim()}` : "",
        payload.skills?.trim() ? `スキル・実績:\n${payload.skills.trim()}` : "",
        payload.profile?.trim() ? `プロフィール・権威性:\n${payload.profile.trim()}` : "",
        payload.audience?.trim() ? `読者・ターゲット:\n${payload.audience.trim()}` : "",
        "上記のプロフィールや権威性は、押し付けず自然に本文へ織り込んでください。",
      ].filter(Boolean);
      return lines.join("\n\n");
    };

    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.has(event.origin) && !event.origin.endsWith(".vercel.app")) return;
      if (event.data?.type !== "clickdesign:sns-context") return;
      const nextConcept = composeConcept(event.data.payload ?? {});
      if (nextConcept.trim()) setConcept(nextConcept);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const generate = async () => {
    const c = concept.trim();
    if (!c) return;
    if (!key) {
      setKeyOpen(true);
      return;
    }
    setLoading(true);
    setSlots(EMPTY);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-key": key,
        },
        body: JSON.stringify({ concept: c }),
      });
      const json = await res.json();
      if (!res.ok) {
        const message = json.error ?? "失敗";
        setSlots(Object.fromEntries(
          CONTENT_TYPES.map((type) => [type, { data: null, error: message }])
        ) as Record<ContentType, Slot>);
      } else {
        setSlots(Object.fromEntries(
          CONTENT_TYPES.map((type) => [type, { data: json.results[type] as Result, error: null }])
        ) as Record<ContentType, Slot>);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "通信エラー";
      setSlots(Object.fromEntries(
        CONTENT_TYPES.map((type) => [type, { data: null, error: message }])
      ) as Record<ContentType, Slot>);
    }
    setLoading(false);
  };

  const readyCount = CONTENT_TYPES.filter((t) => slots[t]?.data || slots[t]?.error).length;

  return (
    <main className="sns-app-shell">
      <header className="sns-app-header">
        <div className="min-w-0">
          <p className="sns-eyebrow">SNS投稿</p>
          <h1 className="sns-title">AI集客オートメーション</h1>
        </div>
        <button className="btn-ghost shrink-0" onClick={() => setKeyOpen(true)}>
          {key ? "APIキー ✓" : "APIキー"}
        </button>
      </header>

      <section className="glass-panel sns-input-panel">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/55">
            コンセプト
          </label>
          <span className="text-xs text-white/40">{concept.length}/400</span>
        </div>
        <textarea
          className="glass-input sns-concept-input"
          placeholder="例：30代からのプログラミング学習、在宅ワークの始め方、見込み客の悩み、あなたの実績など"
          value={concept}
          maxLength={400}
          onChange={(e) => setConcept(e.target.value)}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-relaxed text-white/45">
            note、メルマガ、X、Threads用の投稿文をまとめて生成します。
          </p>
          <button
            className="btn-primary"
            onClick={generate}
            disabled={loading || !concept.trim()}
          >
            {loading ? `生成中 ${readyCount}/4` : "コンテンツ生成"}
          </button>
        </div>
      </section>

      <section className="sns-results-grid">
        {CONTENT_TYPES.map((t) => (
          <ResultCard
            key={t}
            type={t}
            data={slots[t]?.data ?? null}
            error={slots[t]?.error ?? null}
            loading={loading && !slots[t]?.data && !slots[t]?.error}
            onExpand={(data, type) => setModal({ data, type })}
          />
        ))}
      </section>

      <footer className="sns-footer">
        OpenAI APIキーはこのブラウザ内に保存されます
      </footer>

      <ApiKeyDialog
        open={keyOpen}
        initial={key}
        onClose={() => setKeyOpen(false)}
        onSave={save}
      />
      <ResultModal
        type={modal?.type ?? null}
        data={modal?.data ?? null}
        onClose={() => setModal(null)}
      />
    </main>
  );
}
