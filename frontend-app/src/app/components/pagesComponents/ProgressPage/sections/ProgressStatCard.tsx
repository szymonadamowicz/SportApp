import { ProgressStatCardProps } from "@/types/pages/progressPage";

export function ProgressStatCard({
  label,
  value,
  subLabel,
}: ProgressStatCardProps) {
  return (
    <div className="glass-panel card-hover fade-in rounded-2xl px-5 py-4">
      <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)]">
          {value}
        </p>
        {subLabel && (
          <p className="text-xs text-right text-[var(--text-secondary)]">
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );
}
