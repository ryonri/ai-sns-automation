"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gemini_api_key";

export function useGeminiKey() {
  const [key, setKey] = useState<string>("");
  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) ?? "" : "";
    setKey(v);
  }, []);
  const save = (next: string) => {
    setKey(next);
    if (typeof window !== "undefined") {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    }
  };
  return { key, save };
}

export function ApiKeyDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: string;
  onSave: (k: string) => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial, open]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-[min(92vw,520px)] p-6"
      >
        <h2 className="text-lg font-semibold mb-1">Gemini APIキー</h2>
        <p className="text-sm text-white/60 mb-4">
          キーはあなたのブラウザにのみ保存され、生成のたびにリクエストヘッダで送信されます。サーバーには保存しません。
          <br />
          取得:{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-amber-300 underline"
          >
            Google AI Studio
          </a>
        </p>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          className="glass-input mb-4"
          placeholder="AIza..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>
            キャンセル
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSave(value.trim());
              onClose();
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
