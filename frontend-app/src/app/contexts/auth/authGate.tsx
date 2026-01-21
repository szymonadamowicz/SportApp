"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/auth/useAuth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
