import { AuthSession } from "@/types/auth/auth";

const KEY = "rf_auth_session_v1";

export const authStorage = {
  read(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },
  write(session: AuthSession | null) {
    if (typeof window === "undefined") return;
    try {
      if (!session) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify(session));
    } catch {}
  },
};
