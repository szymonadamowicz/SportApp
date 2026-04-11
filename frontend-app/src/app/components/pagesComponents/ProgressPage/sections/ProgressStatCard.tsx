import { ProgressStatCardProps } from "@/types/pages/progressPage";

export function ProgressStatCard({
  label,
  value,
  subLabel,
}: ProgressStatCardProps) {
  return (
    <div className="glass-panel card-hover fade-in min-w-0 rounded-2xl px-4 py-4 sm:px-5">
      <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="min-w-0 break-words text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
          {value}
        </p>
        {subLabel && (
          <p className="shrink-0 text-right text-xs text-[var(--text-secondary)]">
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );
}
