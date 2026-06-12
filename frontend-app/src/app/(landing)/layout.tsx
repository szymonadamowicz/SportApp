import { PageTransition } from "@/components/animations/PageTransition";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh overflow-clip">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
