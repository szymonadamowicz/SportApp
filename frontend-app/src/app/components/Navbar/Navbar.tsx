"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useRememberedRoute } from "@/helpers/utils/navigation/navigationHelper";
import { Dumbbell, Home, TrendingUp, User } from "lucide-react";

const desktopNavItems = [
  { href: "/workouts", label: "Workouts", activePaths: ["/workouts", "/workout-run"] },
  { href: "/progress", label: "Progress", activePaths: ["/progress"] },
  { href: "/profile", label: "Profile", activePaths: ["/profile"] },
];

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: Home, activePaths: ["/dashboard"] },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, activePaths: ["/workouts", "/workout-run"] },
  { href: "/progress", label: "Progress", icon: TrendingUp, activePaths: ["/progress"] },
  { href: "/profile", label: "Profile", icon: User, activePaths: ["/profile"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const getHref = useRememberedRoute();
  const isActive = (paths: string[]) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <>
      <header
        className="
          fixed inset-x-0 top-0 z-50
          h-[calc(3.75rem+env(safe-area-inset-top))] border-b border-borderSoft
          bg-bgMain/90 pt-[env(safe-area-inset-top)] backdrop-blur-md
          md:h-16 md:pt-0
        "
      >
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-5 md:px-8">
        <Link
          href="/dashboard"
          className="text-xl font-semibold tracking-tight text-textPrimary transition hover:text-accentBlue md:text-2xl"
        >
          RepForge
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {desktopNavItems.map((item) => {
            const active = isActive(item.activePaths);
            const href = getHref(item.href);
            return (
              <li key={item.href} className="relative">
                <Link
                  href={href}
                  className={`
                    text-lg font-medium transition duration-300 cursor-pointer
                    ${
                      active
                        ? "text-accentBlue"
                        : "text-textSecondary hover:text-textPrimary hover:scale-105"
                    }
                  `}
                >
                  {item.label}
                </Link>

                {active && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-[6px] left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-accentBlue via-accent to-warning"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {!active && (
                  <motion.div
                    className="absolute -bottom-[6px] left-0 right-0 h-[1px] rounded-full bg-accentBlue/0"
                    whileHover={{
                      backgroundColor: "rgba(56, 189, 248, 0.3)",
                      height: "2px",
                    }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>

      <nav
        className="
          fixed inset-x-0 bottom-0 z-50 border-t border-borderSoft
          bg-bgMain/95 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2
          shadow-[0_-16px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl
          md:hidden
        "
        aria-label="Mobile navigation"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const active = isActive(item.activePaths);
            const href = getHref(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={href}
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition ${
                    active
                      ? "bg-accentBlue/12 text-textPrimary"
                      : "text-textMuted active:bg-bgHighlight/60"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    size={20}
                    className={active ? "text-accentBlue" : "text-textMuted"}
                    strokeWidth={2.1}
                  />
                  <span className="leading-none">{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 -z-10 rounded-2xl border border-accentBlue/25 bg-accentBlue/10"
                      transition={{
                        type: "spring",
                        stiffness: 460,
                        damping: 34,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
