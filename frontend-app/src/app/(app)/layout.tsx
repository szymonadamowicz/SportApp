"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { ActiveWorkoutFloatingTimer } from "@/components/ActiveWorkoutFloatingTimer/ActiveWorkoutFloatingTimer";
import { ActiveWorkoutLifecycleGuard } from "@/components/ActiveWorkoutLifecycleGuard/ActiveWorkoutLifecycleGuard";
import Navbar from "@/components/Navbar/Navbar";
import { AuthGate } from "@/contexts/auth/authGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Navbar />
      <main className="rf-app-page flex-1 pt-[calc(4.25rem+env(safe-area-inset-top))] pb-[calc(7rem+env(safe-area-inset-bottom))] md:pt-24 md:pb-10">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 md:px-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <ActiveWorkoutLifecycleGuard />
      <ActiveWorkoutFloatingTimer />
    </AuthGate>
  );
}
