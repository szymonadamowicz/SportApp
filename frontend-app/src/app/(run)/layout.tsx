"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { AuthGate } from "@/contexts/auth/authGate";

export default function WorkoutRunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <main className="min-h-dvh">
        <PageTransition>{children}</PageTransition>
      </main>
    </AuthGate>
  );
}
