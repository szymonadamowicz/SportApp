import { AuthSession } from "@/types/auth/auth";

const KEY = "rf_auth_session_v1";

const decodeTokenExpiresAt = (token: string): number | null => {
  if (token.startsWith("mock")) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(window.atob(padded)) as { exp?: number };

    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const normalizeSession = (session: AuthSession): AuthSession | null => {
  if (!session.accessToken) return null;

  const expiresAt = session.expiresAt ?? decodeTokenExpiresAt(session.accessToken);
  if (expiresAt && Date.now() >= expiresAt) return null;

  return expiresAt ? { ...session, expiresAt } : session;
};

export const authStorage = {
  read(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;

      const session = normalizeSession(JSON.parse(raw) as AuthSession);
      if (!session) {
        localStorage.removeItem(KEY);
      }

      return session;
    } catch {
      return null;
    }
  },
  write(session: AuthSession | null) {
    if (typeof window === "undefined") return;
    try {
      if (!session) localStorage.removeItem(KEY);
      else {
        const normalized = normalizeSession(session);
        if (!normalized) localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, JSON.stringify(normalized));
      }
    } catch {}
  },
};
