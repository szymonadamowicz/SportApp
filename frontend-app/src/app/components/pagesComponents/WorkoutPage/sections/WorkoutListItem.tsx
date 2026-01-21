"use client";

import { Tag } from "@/components/Tag/Tag";
import { getWorkoutTags } from "@/helpers/ui/workoutTagStyles";
import { WorkoutListItemVMProps } from "@/types/pages/workoutPage";

export function WorkoutListItem({ item, onClick }: WorkoutListItemVMProps) {
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
      className={`glass-panel card-hover px-5 py-4 cursor-pointer fade-in ${stateClass}`}
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
