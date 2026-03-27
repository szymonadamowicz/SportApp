"use client";

import { ProgressLastSessionFeedbackProps } from "@/types/pages/progressPage";
import { BadgeCheck, Flame, Gauge, Sprout } from "lucide-react";

const options = [
  {
    value: "light",
    label: "Felt light",
    Icon: Sprout,
    desc: "Easy session, lots of energy left",
    accent: "text-emerald-400",
    ring: "hover:ring-emerald-400/40",
  },
  {
    value: "balanced",
    label: "Just right",
    Icon: Gauge,
    desc: "Challenging but well balanced",
    accent: "text-sky-400",
    ring: "hover:ring-sky-400/40",
  },
  {
    value: "heavy",
    label: "Very demanding",
    Icon: Flame,
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
        flex flex-col gap-5
        rounded-2xl
        border border-[#26323c]
        bg-[#0f1418]
        p-4 sm:p-6
        shadow-[0_40px_90px_rgba(0,0,0,0.85)]
      "
    >
      {streak !== undefined && (
        <div className="static w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400 sm:absolute sm:right-4 sm:top-4">
          {streak}-day streak
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
            space-y-1 rounded-xl
            border border-emerald-500/40
            bg-[linear-gradient(180deg,rgba(16,185,129,0.22),rgba(16,185,129,0.10))]
            px-4 py-4 sm:px-5
          "
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <BadgeCheck size={16} />
            Thanks for the feedback!
          </p>
          <p className="text-sm text-slate-300">
            We have saved how this workout felt. This helps us better
            understand your recovery and keep your training on track.
          </p>
        </div>
      )}

      {!submitted && !disableButtons && (
        <>
          <p className="max-w-xl text-sm text-slate-300">
            How did this session feel overall? Your answer helps us fine-tune
            future training intensity.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelect?.(opt.value)}
                className={`
                  group min-h-24
                  rounded-xl border border-[#2b3742]
                  bg-[#141b21]
                  px-4 py-4 text-left
                  transition-all duration-200
                  active:scale-[0.99]
                  hover:-translate-y-0.5
                  hover:shadow-lg
                  hover:ring-1 ${opt.ring}
                `}
              >
                <div className="flex items-center gap-2">
                  <opt.Icon className={opt.accent} size={18} />
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
            px-4 py-4 sm:px-5
            text-sm text-slate-300
          "
        >
          You have already shared feedback for this session.
        </div>
      )}
    </div>
  );
}
