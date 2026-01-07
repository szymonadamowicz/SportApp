"use client";

import { getWrapperClass } from "@/helpers/ui/EmptyStateStyles";
import { EmptyStateProps } from "@/types/components/emptyState";

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
      className={`
        ${wrapperClass}
        ${missed ? "border border-amber-400/40 bg-amber-400/5" : ""}
      `}
    >
      {icon && (
        <div
          className={`
            mb-3 flex justify-center text-3xl
            ${missed ? "text-amber-500" : "text-accent"}
          `}
        >
          {icon}
        </div>
      )}

      <h3
        className={`
          text-lg md:text-xl font-semibold
          ${missed ? "text-amber-600" : "text-textPrimary"}
        `}
      >
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm md:text-base text-textSecondary">
          {description}
        </p>
      )}

      {missed && (
        <div className="mt-4 w-full">
          <p className="text-sm md:text-base text-amber-600 font-medium text-center">
            {missedText}
          </p>

          {missedItems && missedItems.length > 0 && (
            <ul className="mt-4 space-y-2">
              {missedItems.map((item) => (
                <li
                  key={item.id}
                  className="
              relative flex items-start gap-3
              rounded-xl border border-amber-400/30
              bg-amber-400/10 px-4 py-3
              text-left
            "
                >
                  <span className="mt-2 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />

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
        <div className="mt-5 flex justify-center">
          <button
            onClick={onAction}
            className={`
              inline-flex items-center justify-center
              rounded-full px-5 py-2.5
              text-sm md:text-base font-semibold
              transition-colors

              ${
                missed
                  ? "bg-amber-500 text-bgMain hover:bg-amber-600 shadow-[0_10px_24px_rgba(245,158,11,0.35)]"
                  : "bg-accent text-bgMain hover:bg-accentHover shadow-[0_10px_24px_rgba(22,163,74,0.45)]"
              }
            `}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}
