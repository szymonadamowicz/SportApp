"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import Navbar from "@/components/Navbar/Navbar";
import { AuthGate } from "@/contexts/auth/authGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Navbar />
      <main className="flex-1 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pt-24 md:pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </AuthGate>
  );
}
