"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useRememberedRoute } from "@/helpers/utils/navigation/navigationHelper";

const navItems = [
  { href: "/workouts", label: "Workouts" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const getHref = useRememberedRoute();

  return (
    <header
      className="
        fixed top-0 inset-x-0 z-50
        bg-bgMain/90 backdrop-blur-md border-b border-borderSoft
        h-16
      "
    >
      <nav className="h-full max-w-6xl mx-auto px-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-2xl font-semibold tracking-tight text-textPrimary transition hover:text-accentBlue"
        >
          RepForge
        </Link>

        <ul className="flex items-center gap-10">
          {navItems.map((item) => {
            const active = pathname === item.href;
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
  );
}
