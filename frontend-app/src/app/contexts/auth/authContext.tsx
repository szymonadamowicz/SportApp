"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { loginApi, registerApi } from "@/api/login.api";
import {
  AuthContextValue,
  AuthSession,
  AuthLoginPayload,
  AuthRegisterPayload,
} from "@/types/auth/auth";
import { authStorage } from "./authStorage";
import { useQueryClient } from "@tanstack/react-query";

export const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_ROUTES = ["/", "/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = authStorage.read();
    if (stored) setSession(stored);
    setIsReady(true);
  }, []);

  const isAuthenticated = !!session?.accessToken;

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
    const token = await loginApi(payload);

    if (!token) throw new Error("Invalid credentials");

    const nextSession: AuthSession = {
      user: { login: payload.login },
      accessToken: token,
    };

    setSession(nextSession);
    authStorage.write(nextSession);
  }, []);

  const register = useCallback(async (payload: AuthRegisterPayload) => {
    const token = await registerApi(payload);

    if (!token) throw new Error("Register failed");

    const nextSession: AuthSession = {
      user: { login: payload.login },
      accessToken: token,
    };

    setSession(nextSession);
    authStorage.write(nextSession);
  }, []);

  const logout = useCallback(async () => {
    setSession(null);
    authStorage.write(null);
    queryClient.clear();
    router.replace("/login");
  }, [router, queryClient]);

  const value: AuthContextValue = useMemo(
    () => ({
      isReady,
      isAuthenticated,
      session,
      login,
      register,
      logout,
    }),
    [isReady, isAuthenticated, session, login, register, logout],
  );

  if (!isReady) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
