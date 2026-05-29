"use client";

import { Tag } from "@/components/Tag/Tag";
import { getWorkoutTags } from "@/helpers/ui/workoutTagStyles";
import { WorkoutListItemVMProps } from "@/types/pages/workoutPage";
import clsx from "clsx";

export function WorkoutListItem({
  item,
  onClick,
  selected,
}: WorkoutListItemVMProps) {
  const stateClass =
    item.status === "missed"
      ? "state-missed"
      : item.status === "upcoming"
        ? "state-upcoming"
        : "";

  const tags = getWorkoutTags(item);

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rf-animate-item rf-hover-lift min-h-16 w-full cursor-pointer rounded-2xl border border-borderSoft/80 px-4 py-3 text-left transition duration-200 sm:rounded-xl",
        stateClass,
        selected
          ? "rf-selection-pop bg-[rgba(34,197,94,0.08)] ring-2 ring-[var(--accent-border)] border border-[var(--accent-border)] shadow-lg shadow-[rgba(34,197,94,0.2)]"
          : "hover:bg-white/5",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.title}</p>
          <p className="truncate text-sm text-textSecondary">{item.mainFocus}</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
          {tags.map((tag) => (
            <Tag key={tag.id} {...tag} />
          ))}
        </div>
      </div>
    </button>
  );
}
