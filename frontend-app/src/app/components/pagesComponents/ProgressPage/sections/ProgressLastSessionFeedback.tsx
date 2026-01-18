"use client";

import { ProgressLastSessionFeedbackProps } from "@/types/pages/progressPage";

const options = [
  {
    value: "light",
    label: "Felt light",
    emoji: "🌱",
    desc: "Easy session, lots of energy left",
    accent: "text-emerald-400",
    ring: "hover:ring-emerald-400/40",
  },
  {
    value: "balanced",
    label: "Just right",
    emoji: "⚖️",
    desc: "Challenging but well balanced",
    accent: "text-sky-400",
    ring: "hover:ring-sky-400/40",
  },
  {
    value: "heavy",
    label: "Very demanding",
    emoji: "🔥",
    desc: "Hard session, close to your limits",
    accent: "text-rose-400",
    ring: "hover:ring-rose-400/40",
  },
] as const;

export function ProgressLastSessionFeedback({
  label,
  streak,
  submitted,
  disableButtons,
  onSelect,
}: ProgressLastSessionFeedbackProps) {
  return (
    <div
      className="
        relative
        rounded-2xl
        bg-[#0f1418]
        border border-[#26323c]
        shadow-[0_40px_90px_rgba(0,0,0,0.85)]
        p-6
        flex flex-col gap-5
      "
    >
      {streak !== undefined && (
        <div className="absolute top-4 right-4 text-xs font-semibold text-emerald-400">
          🔥 {streak}-day streak
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Last completed workout
        </p>
        {label && (
          <p className="text-base font-semibold text-slate-100">{label}</p>
        )}
      </div>

      {submitted && (
        <div
          className="
            rounded-xl
            border border-emerald-500/40
            bg-[linear-gradient(180deg,rgba(16,185,129,0.22),rgba(16,185,129,0.10))]
            px-5 py-4
            space-y-1
          "
        >
          <p className="text-sm font-semibold text-emerald-400">
            🙌 Thanks for the feedback!
          </p>
          <p className="text-sm text-slate-300">
            We’ve saved how this workout felt. This helps us better understand
            your recovery and keep your training on track.
          </p>
        </div>
      )}

      {!submitted && !disableButtons && (
        <>
          <p className="text-sm text-slate-300 max-w-xl">
            How did this session feel overall? Your answer helps us fine-tune
            future training intensity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelect?.(opt.value)}
                className={`
                  group
                  rounded-xl
                  border border-[#2b3742]
                  bg-[#141b21]
                  px-4 py-4
                  text-left
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-lg
                  hover:ring-1 ${opt.ring}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{opt.emoji}</span>
                  <span className={`text-sm font-semibold ${opt.accent}`}>
                    {opt.label}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">{opt.desc}</p>
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            This feedback is combined with your training data to improve
            long-term progress insights.
          </p>
        </>
      )}

      {!submitted && disableButtons && (
        <div
          className="
            rounded-xl
            bg-[#141b21]
            px-5 py-4
            text-sm text-slate-300
          "
        >
          You’ve already shared feedback for this session.
        </div>
      )}
    </div>
  );
}
