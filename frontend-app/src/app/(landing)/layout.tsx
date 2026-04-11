import { PageTransition } from "@/components/animations/PageTransition";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
