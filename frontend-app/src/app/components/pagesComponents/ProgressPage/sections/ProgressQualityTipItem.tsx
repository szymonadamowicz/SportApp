"use client";

import { toneStyles } from "@/helpers/ui/ProgressQualityTipItemStyles";
import { ProgressQualityTipItemProps } from "@/types/pages/progressPage";
import clsx from "clsx";

export function ProgressQualityTipItem({
  label,
  value,
  tone,
  hint,
}: ProgressQualityTipItemProps) {
  return (
    <div
      className="
        rounded-xl
        border border-borderSoft
        bg-bgHighlight/60
        px-4 py-3
        flex flex-col gap-1
      "
    >
      <span className="text-xs text-textSecondary">{label}</span>

      <span className={clsx("text-sm font-semibold", toneStyles[tone])}>
        {value}
      </span>

      {hint && <span className="text-xs text-textSecondary">{hint}</span>}
    </div>
  );
}
