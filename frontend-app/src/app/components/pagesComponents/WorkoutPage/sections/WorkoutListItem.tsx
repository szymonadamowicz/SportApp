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
        "rounded-xl px-4 py-3 cursor-pointer transition",
        stateClass,
        selected ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5",
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
