"use client";

import { getWrapperClass } from "@/helpers/ui/EmptyStateStyles";
import { EmptyStateProps } from "@/types/components/emptyState";
import clsx from "clsx";

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = "default",
  missed = false,
  missedItems,
}: EmptyStateProps) {
  const wrapperClass = getWrapperClass(variant);

  const missedText =
    missedItems && missedItems.length > 0
      ? `You have ${missedItems.length} missed workout${
          missedItems.length > 1 ? "s" : ""
        }.`
      : "You have missed workouts.";

  return (
    <section
      className={clsx(
        wrapperClass,
        "fade-in",
        missed &&
          `
            border border-amber-400/40
            bg-amber-400/5
            shadow-[0_18px_48px_rgba(245,158,11,0.18)]
          `,
      )}
    >
      {icon && (
        <div
          className={clsx(
            "mb-4 flex justify-center text-3xl",
            missed ? "text-amber-500" : "text-accent",
          )}
        >
          {icon}
        </div>
      )}

      <h3
        className={clsx(
          "text-lg md:text-xl font-semibold text-center",
          missed ? "text-amber-400" : "text-textPrimary",
        )}
      >
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm md:text-base text-textSecondary text-center max-w-[60ch] mx-auto">
          {description}
        </p>
      )}

      {missed && (
        <div className="mt-6 w-full">
          <p className="text-sm md:text-base text-amber-400 font-medium text-center">
            {missedText}
          </p>

          {missedItems && missedItems.length > 0 && (
            <ul className="mt-5 space-y-3">
              {missedItems.map((item) => (
                <li
                  key={item.id}
                  className="
                    flex items-start gap-3
                    rounded-xl
                    border border-amber-400/30
                    bg-[linear-gradient(180deg,rgba(245,158,11,0.10),rgba(245,158,11,0.04))]
                    px-4 py-3
                    shadow-[0_8px_20px_rgba(245,158,11,0.15)]
                  "
                >
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-500 flex-shrink-0" />

                  <div className="flex flex-col">
                    <span className="text-sm md:text-base font-medium text-textPrimary">
                      {item.title}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {actionLabel && onAction && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onAction}
            className={clsx(
              `
                inline-flex items-center justify-center
                rounded-full px-6 py-2.5
                text-sm md:text-base font-semibold
                transition
                active:scale-[0.97]
              `,
              missed
                ? `
                    bg-[linear-gradient(135deg,#f59e0b,#d97706)]
                    text-bgMain
                    shadow-[0_12px_30px_rgba(245,158,11,0.45)]
                    hover:shadow-[0_18px_44px_rgba(245,158,11,0.6)]
                  `
                : `
                    bg-[linear-gradient(135deg,#22c55e,#16a34a)]
                    text-bgMain
                    shadow-[0_12px_30px_rgba(34,197,94,0.45)]
                    hover:shadow-[0_18px_44px_rgba(34,197,94,0.6)]
                  `,
            )}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}
