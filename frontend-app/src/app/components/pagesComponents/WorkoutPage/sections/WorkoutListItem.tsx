"use client";

import clsx from "clsx";
import Tag from "@/components/Tag/Tag";
import { WorkoutListItemProps } from "@/types/workoutPage";
import { getWorkoutTagClass } from "@/helpers/ui/workoutTagStyles";


export function WorkoutListItem({ item, selected, dimmed, onClick }: WorkoutListItemProps) {
  const tagClass = getWorkoutTagClass(item.status);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-2xl border px-5 py-4 transition-colors cursor-pointer",
        selected
          ? "bg-infoBlue/30 border-infoBlue"
          : "bg-bgHighlight/70 border-borderSoft hover:bg-bgHighlight/90",
        dimmed && "opacity-40 hover:opacity-100"
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-semibold text-textPrimary">{item.title}</p>
          {item.muscleGroup && (
            <p className="text-sm text-textSecondary capitalize">
              {item.muscleGroup}
            </p>
          )}
        </div>

        <div className="flex gap-1 text-sm font-semibold">
          <Tag label={`⏱ ${item.timeLabel}`} className={tagClass} />
          {item.dayLabel && <Tag label={`📅 ${item.dayLabel}`} className={getWorkoutTagClass("default")} />}
        </div>
      </div>
    </div>
  );
}
