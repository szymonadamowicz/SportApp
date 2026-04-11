"use client";

import Navbar from "@/components/Navbar/Navbar";
import { AuthGate } from "@/contexts/auth/authGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Navbar />
      <main className="mt-24 flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6">{children}</div>
      </main>
    </AuthGate>
  );
}
