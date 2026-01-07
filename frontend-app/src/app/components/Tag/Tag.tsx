"use client";
import { TagProps } from "@/types/components/tag";
import { clsx } from "clsx";

export default function Tag({ label, className }: TagProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium leading-none whitespace-nowrap",
        "border border-transparent",
        className
      )}
    >
      {label}
    </span>
  );
}
