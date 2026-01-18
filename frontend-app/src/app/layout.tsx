import "./styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import Providers from "./provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
    <html lang="en" className={inter.className}>
      <body className="bg-bgMain text-textPrimary antialiased min-h-screen flex flex-col">
        <Navbar />
        <main id="__main" className="pt-16 mt-6 flex-1 relative z-0">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <Providers>{children}</Providers>
          </div>
        </main>
      </body>
    </html>
  );
}

export function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-bgMain text-textPrimary antialiased min-h-screen flex flex-col">
        <main id="__main" className="pt-16 mt-6 flex-1 relative z-0">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <Providers>{children}</Providers>
          </div>
        </main>
      </body>
    </html>
  );
}
