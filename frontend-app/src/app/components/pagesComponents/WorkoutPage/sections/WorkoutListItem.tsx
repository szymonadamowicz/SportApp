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
    <div
      onClick={onClick}
      className={clsx(
        "rounded-xl px-4 py-3 cursor-pointer transition duration-200 border border-borderSoft/80",
        stateClass,
        selected
          ? "bg-[rgba(34,197,94,0.08)] ring-2 ring-[var(--accent-border)] border border-[var(--accent-border)] shadow-lg shadow-[rgba(34,197,94,0.2)]"
          : "hover:bg-white/5",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-sm text-textSecondary">{item.mainFocus}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Tag key={tag.id} {...tag} />
          ))}
        </div>
      </div>
    </div>
  );
}
