"use client";

import { AuthGate } from "@/contexts/auth/authGate";

export default function WorkoutRunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <main className="min-h-screen">{children}</main>
    </AuthGate>
  );
}
