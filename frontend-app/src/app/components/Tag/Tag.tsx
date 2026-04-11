import { TagProps } from "@/types/components/tag";
import clsx from "clsx";

export function Tag({ label, icon, state }: TagProps) {
  return (
    <div
      className={clsx(
        "accent-chip inline-flex max-w-full items-center gap-1 px-3 py-1 text-xs font-medium",
        {
          "state-upcoming": state === "upcoming",
          "state-missed": state === "missed",
          "state-highlight": state === "highlight",
        },
      )}
    >
      {icon && <span className="opacity-80">{icon}</span>}
      <span className="truncate">{label}</span>
    </div>
  );
}
