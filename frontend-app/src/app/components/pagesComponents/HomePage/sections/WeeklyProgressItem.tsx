"use client";

import { Achievement } from "@/types/workout/workout";

export default function WeeklyProgressItem({ title, subtitle }: Achievement) {
  return (
    <div className="rounded-2xl border border-borderSoft bg-bgHighlight/70 px-5 py-4 flex flex-col justify-between">
      <p className="text-xs uppercase tracking-wide text-textSecondary">
        {title}
      </p>

      {subtitle && (
        <p className="mt-2 text-2xl font-semibold text-textPrimary">
          {subtitle}
        </p>
      )}
    </div>
  );
}
