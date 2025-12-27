import "./styles/globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Providers from "./provider";

export const metadata: Metadata = {
  title: "RepForge",
  description: "Workout app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-bgMain text-textPrimary">
      <body>
        <Navbar />
        <main id="__main" className="pt-16 mt-10 relative z-0 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <Providers>{children}</Providers>
          </div>
        </main>
      </body>
    </html>
  );
}
