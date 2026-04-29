"use client";

import { useState } from "react";
import { ApiKeyDialog, useGeminiKey } from "@/components/ApiKeyDialog";
import { ResultCard, type Result } from "@/components/ResultCard";
import { ResultModal } from "@/components/ResultModal";
import { CONTENT_TYPES, type ContentType } from "@/lib/prompts";

type Slot = { data: Result | null; error: string | null };
const EMPTY: Record<ContentType, Slot> = {
  note: { data: null, error: null },
  melmaga: { data: null, error: null },
  x: { data: null, error: null },
  threads: { data: null, error: null },
};

export default function Page() {
  const { key, save } = useGeminiKey();
  const [keyOpen, setKeyOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<Record<ContentType, Slot>>(EMPTY);
  const [modal, setModal] = useState<{ data: Result; type: ContentType } | null>(null);

  const generate = async () => {
    const c = concept.trim();
    if (!c) return;
    if (!key) {
      setKeyOpen(true);
      return;
    }
    setLoading(true);
    setSlots(EMPTY);

    await Promise.all(
      CONTENT_TYPES.map(async (type) => {
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-gemini-key": key,
            },
            body: JSON.stringify({ concept: c, type }),
          });
          const json = await res.json();
          if (!res.ok) {
            setSlots((s) => ({
              ...s,
              [type]: { data: null, error: json.error ?? "失敗" },
            }));
            return;
          }
          setSlots((s) => ({ ...s, [type]: { data: json as Result, error: null } }));
        } catch (err) {
          setSlots((s) => ({
            ...s,
            [type]: {
              data: null,
              error: err instanceof Error ? err.message : "通信エラー",
            },
          }));
        }
      })
    );
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:py-16">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            AI集客オートメーション
          </h1>
          <p className="mt-2 text-sm text-white/60">
            集客のためのコンテンツを、一瞬で。
          </p>
        </div>
        <button className="btn-ghost" onClick={() => setKeyOpen(true)}>
          {key ? "APIキー ✓" : "APIキー"}
        </button>
      </header>

      <section className="glass-panel mb-10 p-5 md:p-6">
        <label className="mb-2 block text-xs uppercase tracking-widest text-white/55">
          Concept
        </label>
        <input
          className="glass-input mb-4"
          placeholder="例：30代からのプログラミング学習、在宅ワークの始め方..."
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && generate()}
        />
        <button
          className="btn-primary"
          onClick={generate}
          disabled={loading || !concept.trim()}
        >
          {loading ? "生成中..." : "✨ コンテンツを生成する"}
        </button>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CONTENT_TYPES.map((t) => (
          <ResultCard
            key={t}
            type={t}
            data={slots[t].data}
            error={slots[t].error}
            loading={loading && !slots[t].data && !slots[t].error}
            onExpand={(data, type) => setModal({ data, type })}
          />
        ))}
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        Powered by Gemini · BYOK · keys are stored only in your browser
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
