"use client";

import { ProgressActivityPanelProps } from "@/types/pages/progressPage";

const consistencyLabel = {
  low: "Low consistency",
  medium: "Balanced",
  high: "Very consistent",
};

export function ActivityPanel({
  streak,
  consistency,
}: ProgressActivityPanelProps) {
  return (
    <div
      className="
        rounded-2xl
        bg-infoBlue/20
        border border-infoBlue/40
        p-6
        flex flex-col gap-4
      "
    >
      <div>
        <p className="text-sm text-textSecondary">Activity</p>
        <p className="text-lg font-semibold text-textPrimary">
          {consistencyLabel[consistency]}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-textSecondary">Streak</span>
        <span className="text-lg font-semibold text-textPrimary">
          🔥 {streak} days
        </span>
      </div>
    </div>
  );
}
