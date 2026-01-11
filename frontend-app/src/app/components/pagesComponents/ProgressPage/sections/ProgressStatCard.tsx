"use client";

import { ProgressStatCardProps } from "@/types/pages/progressPage";

export function ProgressStatCard({
  label,
  value,
  subLabel,
}: ProgressStatCardProps) {
  return (
    <div
      className="
        rounded-2xl
        bg-infoBlue/20
        border border-infoBlue/40
        px-5 py-4
        flex flex-col gap-1
      "
    >
      <span className="text-xs text-textSecondary">{label}</span>
      <span className="text-xl font-semibold text-textPrimary">{value}</span>
      {subLabel && <span className="text-xs text-infoBlue">{subLabel}</span>}
    </div>
  );
}
