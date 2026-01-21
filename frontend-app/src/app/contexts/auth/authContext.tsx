"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loginApi, registerApi } from "@/api/login.api";
import {
  AuthContextValue,
  AuthSession,
  AuthLoginPayload,
  AuthRegisterPayload,
} from "@/types/auth/auth";

export const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "rf_auth_session_v1";
const PUBLIC_ROUTES = ["/", "/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSession(JSON.parse(raw));
      }
    } catch {}
    setIsReady(true);
  }, []);

  const isAuthenticated = !!session;

  useEffect(() => {
    if (!isReady) return;

    const path = pathname ?? "/";
    const isPublic = PUBLIC_ROUTES.includes(path);

    if (!isPublic && !isAuthenticated) {
      router.replace("/login");
    }

    if (isPublic && isAuthenticated && path === "/login") {
      router.replace("/dashboard");
    }
  }, [isReady, isAuthenticated, pathname, router]);

  const login = useCallback(async (payload: AuthLoginPayload) => {
    const ok = await loginApi(payload);
    if (!ok) throw new Error("Invalid credentials");

    const nextSession: AuthSession = {
      user: { login: payload.login },
    };

    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const register = useCallback(async (payload: AuthRegisterPayload) => {
    const ok = await registerApi(payload);
    if (!ok) throw new Error("Register failed");

    const nextSession: AuthSession = {
      user: { login: payload.login },
    };

    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const logout = useCallback(async () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
    router.replace("/login");
  }, [router]);

  const value: AuthContextValue = {
    isReady,
    isAuthenticated,
    session,
    login,
    register,
    logout,
  };

  if (!isReady) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
