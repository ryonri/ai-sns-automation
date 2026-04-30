"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendSignInLinkToEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth-context";

const EMAIL_FOR_SIGN_IN = "emailForSignIn";
const RESEND_COOLDOWN_KEY = "cd_lastSendAt";
const RESEND_COOLDOWN_MS = 60 * 1000;

function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const { status, pendingError, clearMessages } = useAuth();
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (pendingError) {
      setError(pendingError);
      clearMessages();
    }
  }, [pendingError, clearMessages]);

  async function handleSend() {
    setError(null);
    setInfo(null);

    const target = email.trim().toLowerCase();
    if (!target) {
      setError("メールアドレスを入力してください。");
      return;
    }
    if (!isValidEmailFormat(target)) {
      setError("メールアドレスの形式が正しくありません。");
      return;
    }

    const lastSendAt = Number(window.localStorage.getItem(RESEND_COOLDOWN_KEY) || 0);
    const elapsed = Date.now() - lastSendAt;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      setError(`再送信は ${wait} 秒後に可能です。`);
      return;
    }

    setSending(true);
    try {
      await sendSignInLinkToEmail(getFirebaseAuth(), target, {
        url: window.location.href,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN, target);
      window.localStorage.setItem(RESEND_COOLDOWN_KEY, String(Date.now()));
      setInfo(`ログイン用のリンクを ${target} 宛に送信しました。メールをご確認ください。`);
      setEmail("");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "unknown";
      const message = (err as { message?: string })?.message ?? "";
      console.error("sendSignInLinkToEmail failed:", err);
      if (code === "auth/invalid-email") {
        setError("有効なメールアドレス形式ではありません。");
      } else if (code === "auth/too-many-requests") {
        setError("一時的にアクセスが制限されています。しばらくしてからお試しください。");
      } else {
        setError(`メールの送信に失敗しました [${code}]: ${message}`);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-md items-center justify-center px-5 py-10">
      <div className="glass-panel w-full p-6 md:p-8">
        <h1 className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
          AI集客オートメーション
        </h1>
        <p className="mt-2 text-sm text-white/60">
          登録済みのメールアドレスでログインしてください。
        </p>

        <label className="mt-6 mb-2 block text-xs uppercase tracking-widest text-white/55">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          className="glass-input mb-4"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
          disabled={sending}
        />

        <button
          className="btn-primary w-full justify-center"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? "送信中..." : "ログインリンクを送信"}
        </button>

        {info && (
          <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            {info}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs text-white/40">
          ※ パスワード不要。届いたメールのリンクをクリックするとログインが完了します。
        </p>
      </div>
    </main>
  );
}
