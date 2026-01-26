import clsx from "clsx";

export const getWrapperClass = () =>
  clsx(
    "rounded-2xl px-6 py-6 md:px-7 md:py-7 text-center",
    "flex flex-col items-center justify-center gap-3",
    "bg-bgCard border border-borderSoft shadow-sm",
    "text-textSecondary"
  );
