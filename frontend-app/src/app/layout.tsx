"use client";

import Providers from "./provider";
import { AuthProvider } from "./contexts/auth/authContext";
import { ActiveWorkoutFloatingTimer } from "./components/ActiveWorkoutFloatingTimer/ActiveWorkoutFloatingTimer";
import { ActiveWorkoutLifecycleGuard } from "./components/ActiveWorkoutLifecycleGuard/ActiveWorkoutLifecycleGuard";
import "./styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            {children}
            <ActiveWorkoutLifecycleGuard />
            <ActiveWorkoutFloatingTimer />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
