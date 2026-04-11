import clsx from "clsx";

export const emptyStateWrapperClass = () =>
  clsx(
    "rounded-2xl px-6 py-6 md:px-7 md:py-7 text-center",
    "flex flex-col items-center justify-center gap-3",
    "rf-surface-card",
    "rf-text-muted",
  );

export const getWrapperClass = emptyStateWrapperClass;
