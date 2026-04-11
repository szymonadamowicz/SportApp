import { ProgressStatCardProps } from "@/types/pages/progressPage";
import { Flame } from "lucide-react";

export function ProgressStreakSummary({
  label,
  value,
  subLabel,
}: ProgressStatCardProps) {
  return (
    <div className="glass-panel card-hover fade-in min-w-0 rounded-2xl px-4 py-4 sm:col-span-2 sm:px-5 lg:col-span-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rf-icon-chip rf-icon-chip--warning">
            <Flame className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
              {label}
            </p>
            <p className="mt-1 break-words text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              {value}
            </p>
          </div>
        </div>

        {subLabel && (
          <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );
}
