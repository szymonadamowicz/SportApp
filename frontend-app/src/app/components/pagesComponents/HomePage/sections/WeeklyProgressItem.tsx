"use client";

import { ProgressAchievements } from "@/types/progress/progress";

export default function WeeklyProgressItem({
  title,
  value,
}: ProgressAchievements) {
  return (
    <div className="rounded-2xl border border-borderSoft bg-bgHighlight/70 px-5 py-4 flex flex-col justify-between">
      <p className="text-xs uppercase tracking-wide text-textSecondary">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold text-textPrimary">{value}</p>
    </div>
  );
}
