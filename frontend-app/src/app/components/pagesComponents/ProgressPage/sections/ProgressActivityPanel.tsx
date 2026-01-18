import { Flame } from "lucide-react";

type Props = {
  streak: number;
};

export function ProgressActivityPanel({ streak }: Props) {
  const days = streak ?? 0;

  const accent = days > 0 ? "rgba(34,197,94,0.35)" : "rgba(156,163,175,0.22)";
  const glow = days > 0 ? "rgba(34,197,94,0.18)" : "rgba(0,0,0,0.0)";

  return (
    <div
      className="glass-panel fade-in rounded-2xl px-5 py-4"
      style={{
        borderColor: accent,
        boxShadow: `0 0 0 1px ${glow}, 0 18px 55px rgba(0,0,0,0.55)`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="grid place-items-center h-9 w-9 rounded-xl"
            style={{
              background:
                days > 0 ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${accent}`,
            }}
          >
            <Flame
              size={18}
              style={{
                color: days > 0 ? "var(--accent)" : "var(--text-secondary)",
              }}
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
              Streak
            </p>
            <p className="text-base font-semibold text-[var(--text-primary)]">
              {days} day{days === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background:
              days > 0 ? "var(--accent-soft)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${accent}`,
            color: days > 0 ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          {days > 0 ? "Keep it going" : "Start today"}
        </span>
      </div>
    </div>
  );
}
