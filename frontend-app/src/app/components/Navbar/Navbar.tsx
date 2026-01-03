"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { href: "/workouts", label: "Workouts" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

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
          href="/"
          className="text-2xl font-semibold text-textPrimary tracking-tight hover:text-accent transition"
        >
          RepForge
        </Link>

        <ul className="flex items-center gap-10">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="relative">
                <button
                  onClick={() => router.push(item.href)}
                  className={`
                    text-lg font-medium transition
                    ${
                      active
                        ? "text-accent"
                        : "text-textSecondary hover:text-textPrimary"
                    }
                  `}
                >
                  {item.label}
                </button>

                {active && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-[6px] left-0 right-0 h-[2px] bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
