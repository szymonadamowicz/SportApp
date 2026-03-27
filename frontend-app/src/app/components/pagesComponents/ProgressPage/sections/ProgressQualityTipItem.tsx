import { getToneStyles } from "@/helpers/ui/ProgressQualityTipItemStyles";
import { ProgressQualityTipItemProps } from "@/types/pages/progressPage";

export function ProgressQualityTipItem({
  label,
  value,
  tone,
}: ProgressQualityTipItemProps) {
  return (
    <div className={getToneStyles(tone)}>
      <div className="flex items-start gap-3 p-4">
        <span
          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            background:
              tone === "positive"
                ? "var(--accent)"
                : tone === "warning"
                  ? "var(--warning)"
                  : "rgba(56,189,248,1)",
          }}
        />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {label}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{value}</p>
        </div>
      </div>
    </div>
  );
}
