"use client";

import { getWrapperClass } from "@/helpers/ui/EmptyStateStyles";
import { EmptyStateProps } from "@/types/emptyState";

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const wrapperClass = getWrapperClass(variant);

  return (
    <section className={wrapperClass}>
      {icon && (
        <div className="mb-3 flex justify-center text-3xl text-accent">
          {icon}
        </div>
      )}

      <h3 className="text-textPrimary text-lg md:text-xl font-semibold">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm md:text-base text-textSecondary">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={onAction}
            className="
              inline-flex items-center justify-center
              rounded-full bg-accent px-5 py-2.5
              text-sm md:text-base font-semibold text-bgMain
              shadow-[0_10px_24px_rgba(22,163,74,0.45)]
              hover:bg-accentHover transition-colors
            "
          >
            {actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}
