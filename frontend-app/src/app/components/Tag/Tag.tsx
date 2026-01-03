"use client";
import { TagProps } from "@/types/tag";
import { clsx } from "clsx";

export default function Tag({ label, className }: TagProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {label}
    </span>
  );
}
