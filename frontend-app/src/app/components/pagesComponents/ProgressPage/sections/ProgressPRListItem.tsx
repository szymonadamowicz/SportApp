import { ProgressPRListItemProps } from "@/types/pages/progressPage";

export function PRListItem({
  name,
  value,
  diff,
}: ProgressPRListItemProps) {
  return (
    <div
      className="
        card-elevated card-hover fade-in
        rounded-2xl px-4 py-3
        border border-[rgba(56,189,248,0.25)]
        shadow-[0_16px_40px_rgba(56,189,248,0.10)]
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {name}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{value}</p>
        </div>

        <span
          className="
            inline-flex items-center
            rounded-full px-2.5 py-1
            text-xs font-semibold
            border border-[rgba(56,189,248,0.35)]
            bg-[rgba(56,189,248,0.12)]
            text-[rgba(125,211,252,0.95)]
          "
        >
          {diff}
        </span>
      </div>
    </div>
  );
}
