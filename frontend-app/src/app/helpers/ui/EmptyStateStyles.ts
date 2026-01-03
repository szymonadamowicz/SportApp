import { EmptyStateVariant } from "@/types/emptyState";
import clsx from "clsx";

export const getWrapperClass = (variant: EmptyStateVariant) =>
  clsx(
    "rounded-2xl border px-6 py-6 md:px-7 md:py-7 text-center",
    "bg-bgCard shadow-sm",
    variant === "default" && "border-borderSoft",
    variant === "soft" && "border-borderSoft bg-bgHighlight/40",
    variant === "highlight" &&
      "border-accent/40 bg-gradient-to-br from-accent/10 to-bgMain"
  );
