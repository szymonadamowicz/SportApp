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
import { numericOnly } from "@/helpers/utils/workout/workoutDraftChanged";
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

  const exercises = [
    ...workout.exercises.map((e) => ({ id: e.id, original: e })),
    ...Object.keys(draft)
      .filter((id) => !workout.exercises.some((e) => e.id === id))
      .map((id) => ({ id, original: null })),
  ];

  return (
    <div className="mt-4 space-y-3">
      {exercises.length === 0 && !editMode && (
        <EmptyState
          title="No Exercises Added"
          description="You can start adding exercises to this workout by pressing button below."
          actionLabel="Add Exercises"
          onAction={onPress}
        />
      )}

      {exercises.map(({ id, original }) => {
        const d = draft[id];
        const e = errors?.[id];

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
                      e?.name && "border-red-400"
                    )}
                    value={d?.name ?? original?.name ?? ""}
                    onChange={(ev) =>
                      onDraftChange(id, { name: ev.target.value })
                    }
                  />
                  <div className="min-h-[14px] mt-1 text-xs text-red-400">
                    {e?.name ?? ""}
                  </div>
                </>
              ) : (
                <span className="font-semibold">{original?.name ?? "—"}</span>
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
                      e?.sets && "border-red-400"
                    )}
                    value={d?.sets ?? String(original?.sets ?? "")}
                    onChange={(ev) =>
                      onDraftChange(id, {
                        sets: numericOnly(ev.target.value),
                      })
                    }
                  />
                  <div className="min-h-[14px] mt-1 text-xs text-red-400 text-center">
                    {e?.sets ?? ""}
                  </div>
                </>
              ) : (
                <span>{original?.sets ?? "—"}</span>
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
                      e?.reps && "border-red-400"
                    )}
                    value={d?.reps ?? String(original?.reps ?? "")}
                    onChange={(ev) =>
                      onDraftChange(id, {
                        reps: numericOnly(ev.target.value),
                      })
                    }
                  />
                  <div className="min-h-[14px] mt-1 text-xs text-red-400 text-center">
                    {e?.reps ?? ""}
                  </div>
                </>
              ) : (
                <span>{original?.reps ?? "—"}</span>
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
                  value={d?.weight ?? original?.weight?.toString() ?? ""}
                  onChange={(ev) =>
                    onDraftChange(id, {
                      weight: numericOnly(ev.target.value),
                    })
                  }
                />
              ) : (
                <span>{original?.weight ?? "—"}</span>
              )}
            </div>

            <div className={clsx(cellClass, "flex flex-col items-center")}>
              <span className={labelClass}>Rest</span>
              {editMode ? (
                <input
                  className={clsx(editInputClass, "w-16 text-right")}
                  value={
                    d?.restTimeSec ?? original?.restTimeSec?.toString() ?? ""
                  }
                  onChange={(ev) =>
                    onDraftChange(id, {
                      restTimeSec: numericOnly(ev.target.value),
                    })
                  }
                />
              ) : (
                <span>{original?.restTimeSec ?? "—"}</span>
              )}
            </div>

            {editMode && onRemoveExercise && (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => onRemoveExercise(id)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-textSecondary hover:text-red-400 hover:bg-red-400/10 transition"
                  title="Remove exercise"
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
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm text-accent hover:bg-accent/25"
        >
          <Plus size={16} />
          Add exercise
        </button>
      )}
    </div>
  );
};
