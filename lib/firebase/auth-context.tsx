"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./client";

const EMAIL_FOR_SIGN_IN = "emailForSignIn";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  signOut: () => Promise<void>;
  pendingMessage: string | null;
  pendingError: string | null;
  clearMessages: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function isEmailAllowed(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const docId = email.trim().toLowerCase();
  try {
    const snap = await getDoc(doc(getFirebaseDb(), "allowlist", docId));
    return snap.exists();
  } catch (err) {
    console.error("allowlist check failed:", err);
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();

    let cancelled = false;

    async function handleEmailLinkIfNeeded() {
      if (!isSignInWithEmailLink(auth, window.location.href)) return false;

      let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN);
      if (!email) {
        email = window.prompt(
          "確認のため、ログインしたメールアドレスを再度入力してください："
        );
      }
      if (!email) return false;

      try {
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem(EMAIL_FOR_SIGN_IN);
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
      } catch (err) {
        console.error("signInWithEmailLink failed:", err);
        if (!cancelled) {
          setPendingError("ログインリンクの有効期限が切れているか、無効です。再度ログインをお試しください。");
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        return false;
      }
    }

    handleEmailLinkIfNeeded();

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (cancelled) return;
      if (!fbUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      const allowed = await isEmailAllowed(fbUser.email);
      if (!allowed) {
        await fbSignOut(auth);
        setUser(null);
        setStatus("unauthenticated");
        setPendingError(
          "このメールアドレスは登録されていません。管理者にお問い合わせください。"
        );
        return;
      }
      setUser(fbUser);
      setStatus("authenticated");
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signOut: async () => {
        await fbSignOut(getFirebaseAuth());
      },
      pendingMessage,
      pendingError,
      clearMessages: () => {
        setPendingMessage(null);
        setPendingError(null);
      },
    }),
    [user, status, pendingMessage, pendingError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
