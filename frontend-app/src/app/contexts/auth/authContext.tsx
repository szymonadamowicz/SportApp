"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { clearLiveActiveWorkoutRun } from "@/state/activeWorkoutRun.live";

export const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_ROUTES = ["/", "/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const lastResetRef = useRef(0);
  const lastStorageWriteRef = useRef(0);

  const THROTTLE_MS = 5000; // throttle activity handling to once per 5 seconds

  const INACTIVITY_TIMEOUT_MS =
    (Number(process.env.NEXT_PUBLIC_SESSION_INACTIVITY_MINUTES) || 30) *
    60 *
    1000;

  useEffect(() => {
    const stored = authStorage.read();

    if (stored) {
      const last = stored.lastActive ?? Date.now();
      const expired = Date.now() - last > INACTIVITY_TIMEOUT_MS;
      if (!expired) setSession(stored);
      else authStorage.write(null);
    }

    setIsReady(true);
  }, [INACTIVITY_TIMEOUT_MS]);

  const isAuthenticated = !!session?.accessToken;

  useEffect(() => {
    if (!isReady) return;

    const path = pathname ?? "/";
    const isPublic = PUBLIC_ROUTES.includes(path);

    if (!isPublic && !isAuthenticated) {
      router.replace("/login");
    }

    if (isPublic && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isReady, isAuthenticated, pathname, router]);

  const login = useCallback(async (payload: AuthLoginPayload) => {
    const token = await loginApi(payload);

    if (!token) throw new Error("Invalid credentials");
    clearLiveActiveWorkoutRun();
    queryClient.clear();

    const nextSession: AuthSession = {
      user: { login: payload.login },
      accessToken: token,
      lastActive: Date.now(),
    };

    setSession(nextSession);
    authStorage.write(nextSession);
  }, [queryClient]);

  const register = useCallback(async (payload: AuthRegisterPayload) => {
    const token = await registerApi(payload);

    if (!token) throw new Error("Register failed");
    clearLiveActiveWorkoutRun();
    queryClient.clear();

    const nextSession: AuthSession = {
      user: { login: payload.login },
      accessToken: token,
      lastActive: Date.now(),
    };

    setSession(nextSession);
    authStorage.write(nextSession);
  }, [queryClient]);

  const logout = useCallback(async () => {
    setSession(null);
    authStorage.write(null);
    clearLiveActiveWorkoutRun();
    queryClient.clear();
    router.replace("/login");
  }, [router, queryClient]);

  const resetActivity = useCallback(() => {
    if (!session) return;
    const now = Date.now();
    const prev = session.lastActive ?? 0;
    if (now - prev < THROTTLE_MS) return; // avoid frequent updates

    const next = { ...session, lastActive: now };
    setSession(next);
    if (now - lastStorageWriteRef.current > THROTTLE_MS) {
      authStorage.write(next);
      lastStorageWriteRef.current = now;
    }
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (!session) {
      return;
    }

    const startTimer = () => {
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastResetRef.current > THROTTLE_MS) {
        resetActivity();
        startTimer();
        lastResetRef.current = now;
      }
    };

    events.forEach((e) => window.addEventListener(e, onActivity));
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // don't treat visibilitychange as user activity, only restart timer
        startTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    startTimer();

    return () => {
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [session, INACTIVITY_TIMEOUT_MS, logout, resetActivity]);

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
