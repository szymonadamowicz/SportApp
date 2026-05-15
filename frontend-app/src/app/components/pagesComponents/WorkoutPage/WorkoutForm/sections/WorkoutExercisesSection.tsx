"use client";

import clsx from "clsx";
import {
  cellClass,
  editInputClass,
  labelClass,
  rowClass,
} from "@/helpers/ui/workoutExercisesStyles";
import { WorkoutExercisesSectionProps } from "@/types/pages/workoutPage";
import EmptyState from "@/components/EmptyState/EmptyState";
import { Plus, X } from "lucide-react";

export const WorkoutExercisesSection = ({
  workout,
  editMode,
  draft,
  errors,
  onDraftChange,
  onPress,
  onAddExercise,
  onRemoveExercise,
}: WorkoutExercisesSectionProps) => {
  const gridClass = editMode
    ? "grid-cols-[1fr_64px_20px_64px_20px_88px_64px_40px]"
    : "grid-cols-[1fr_64px_20px_64px_20px_88px_64px]";

  const exerciseIds = editMode
    ? Object.entries(draft)
        .sort(
          ([leftId, leftDraft], [rightId, rightDraft]) =>
            (leftDraft.orderIndex ?? 0) - (rightDraft.orderIndex ?? 0) ||
            leftId.localeCompare(rightId),
        )
        .map(([id]) => id)
    : [...workout.exercises]
        .sort(
          (left, right) =>
            (left.orderIndex ?? 0) - (right.orderIndex ?? 0) ||
            left.id.localeCompare(right.id),
        )
        .map((e) => e.id);

  if (exerciseIds.length === 0 && !editMode) {
    return (
      <EmptyState
        title="No Exercises Added"
        description="You can start adding exercises to this workout by pressing button below."
        actionLabel="Add Exercises"
        onAction={onPress}
      />
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {exerciseIds.map((id) => {
        const d = editMode ? draft[id] : undefined;
        const original = workout.exercises.find((e) => e.id === id);
        const e = errors?.[id];

        const view = editMode ? d : original;
        if (!view) return null;

        return (
          <div
            key={id}
            className={clsx(rowClass, "grid items-start gap-x-2", gridClass)}
          >
            <div className={clsx(cellClass, "flex flex-col")}>
              <span className={labelClass}>Exercise</span>
              {editMode ? (
                <>
                  <input
                    className={clsx(
                      editInputClass,
                      e?.name && "border-red-400",
                    )}
                    value={view.name}
                    onChange={(ev) =>
                      onDraftChange(id, { name: ev.target.value })
                    }
                  />
                  <div className="min-h-[14px] mt-1 text-xs text-red-400">
                    {e?.name ?? ""}
                  </div>
                </>
              ) : (
                <span className="font-semibold">{view.name}</span>
              )}
            </div>

            <div className={clsx(cellClass, "flex flex-col items-center")}>
              <span className={labelClass}>Sets</span>
              {editMode ? (
                <>
                  <input
                    className={clsx(
                      editInputClass,
                      "w-14 text-center",
                      e?.sets && "border-red-400",
                    )}
                    value={view.sets}
                    onChange={(ev) =>
                      onDraftChange(id, { sets: Number(ev.target.value) })
                    }
                  />
                  <div className="min-h-[14px] mt-1 text-xs text-red-400 text-center">
                    {e?.sets ?? ""}
                  </div>
                </>
              ) : (
                <span>{view.sets}</span>
              )}
            </div>

            <div className="flex items-center justify-center text-textSecondary">
              ×
            </div>

            <div className={clsx(cellClass, "flex flex-col items-center")}>
              <span className={labelClass}>Reps</span>
              {editMode ? (
                <>
                  <input
                    className={clsx(
                      editInputClass,
                      "w-14 text-center",
                      e?.reps && "border-red-400",
                    )}
                    value={view.reps}
                    onChange={(ev) =>
                      onDraftChange(id, { reps: Number(ev.target.value) })
                    }
                  />
                  <div className="min-h-[14px] mt-1 text-xs text-red-400 text-center">
                    {e?.reps ?? ""}
                  </div>
                </>
              ) : (
                <span>{view.reps}</span>
              )}
            </div>

            <div className="flex items-center justify-center text-textSecondary">
              @
            </div>

            <div className={clsx(cellClass, "flex flex-col items-center")}>
              <span className={labelClass}>Weight</span>
              {editMode ? (
                <input
                  className={clsx(editInputClass, "w-20 text-right")}
                  value={view.weight ?? ""}
                  onChange={(ev) =>
                    onDraftChange(id, {
                      weight: Number(ev.target.value) || undefined,
                    })
                  }
                />
              ) : (
                <span>{view.weight ?? "—"}</span>
              )}
            </div>

            <div className={clsx(cellClass, "flex flex-col items-center")}>
              <span className={labelClass}>Rest</span>
              {editMode ? (
                <input
                  className={clsx(editInputClass, "w-16 text-right")}
                  value={view.restTimeSec ?? ""}
                  onChange={(ev) =>
                    onDraftChange(id, {
                      restTimeSec: Number(ev.target.value) || undefined,
                    })
                  }
                />
              ) : (
                <span>{view.restTimeSec ?? "—"}</span>
              )}
            </div>

            {editMode && onRemoveExercise && (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => onRemoveExercise(id)}
                  className="h-8 w-8 rounded-full flex items-center justify-center
                             text-textSecondary hover:text-red-400
                             hover:bg-red-400/10 transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {editMode && onAddExercise && (
        <button
          onClick={onAddExercise}
          className={clsx(
            `
                inline-flex items-center gap-2
                rounded-full
                px-4 py-2 text-sm font-medium
          
                border border-[rgba(34,197,94,0.35)]
                text-accent
                bg-[rgba(34,197,94,0.10)]
          
                hover:bg-[rgba(34,197,94,0.18)]
                hover:border-[rgba(34,197,94,0.55)]
          
                active:scale-[0.98]
                transition
              `,
          )}
        >
          <Plus size={16} />
          Add exercise
        </button>
      )}
    </div>
  );
};
