"use client";

import { ProgressLastSessionFeedbackProps } from "@/types/pages/progressPage";

const options = [
  {
    value: "light",
    label: "Light",
    emoji: "🟢",
    desc: "Felt easy, plenty of energy left",
  },
  {
    value: "balanced",
    label: "Just right",
    emoji: "🟡",
    desc: "Challenging but manageable",
  },
  {
    value: "heavy",
    label: "Heavy",
    emoji: "🔴",
    desc: "Very demanding, close to limits",
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
        bg-infoBlue/20
        border border-infoBlue/40
        p-6
        flex flex-col gap-5
      "
    >
      <div className="absolute top-4 right-4 text-sm font-semibold text-infoBlue">
        🔥 {streak} days
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-textSecondary">Last session</span>
        <span className="text-base font-semibold text-textPrimary">
          {label}
        </span>
      </div>

      {submitted ? (
        <div
          className="
            flex flex-col gap-2
            rounded-xl
            bg-bgHighlight/60
            border border-borderSoft
            px-5 py-4
          "
        >
          <p className="text-sm font-semibold text-textPrimary">
            🙌 Thanks for letting us know
          </p>
          <p className="text-sm text-textSecondary">
            Your feedback helps us better understand how your training feels and
            improves future recommendations.
          </p>
        </div>
      ) : (
        !disableButtons && (
          <>
            <p className="text-md text-textSecondary max-w-xl">
              How did your last workout feel overall? This helps us better
              understand your recovery and adjust future training load.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {options.map((opt) => {
                return (
                  <button
                    key={opt.value}
                    onClick={() => onSelect && onSelect(opt.value)}
                    className={`
                    group
                    rounded-xl px-4 py-3
                    border text-left
                    transition-all duration-200
                    cursor-pointer
                    hover:bg-bgHighlight/90
                    hover:-translate-y-0.5
                    hover:shadow-lg
                    hover:ring-1 hover:ring-infoBlue/40
                  `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{opt.emoji}</span>
                      <span
                        className={`
                        text-md font-semibold
                      `}
                      >
                        {opt.label}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-textSecondary">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-textSecondary">
              Your feedback is combined with training data to improve progress
              insights.
            </p>
          </>
        )
      )}
    </div>
  );
}
