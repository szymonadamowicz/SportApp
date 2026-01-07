"use client";

import clsx from "clsx";
import {
  cellClass,
  editInputClass,
  labelClass,
  rowClass,
} from "@/helpers/ui/workoutExercisesStyles";
import {
  ValueWithUnitProps,
  WorkoutExercisesSectionProps,
} from "@/types/pages/workoutPage";
import EmptyState from "@/components/EmptyState/EmptyState";
import { numericOnly } from "@/helpers/utils/workout/workoutDraftChanged";

export const WorkoutExercisesSection = ({
  workout,
  editMode,
  draft,
  onDraftChange,
}: WorkoutExercisesSectionProps) => {
  const ValueWithUnit = ({ value, unit }: ValueWithUnitProps) => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-textSecondary">—</span>;
    }

    return (
      <span className="inline-flex items-baseline justify-center">
        <span>{value}</span>
        <span className="ml-0.5 text-xs text-textSecondary">{unit}</span>
      </span>
    );
  };

  return (
    <div className="mt-4 space-y-3">
      {workout.exercises.length === 0 && (
        <EmptyState
          title="No Exercises Added"
          description="You can start adding exercises to this workout by pressing button below."
          actionLabel="Add Exercises"
          onAction={() => console.log("add exercise")}
        />
      )}

      {workout.exercises.map((ex) => {
        const d = draft[ex.id];

        return (
          <div key={ex.id} className={rowClass}>
            <div className={clsx(cellClass, "col-span-5 flex flex-col")}>
              <span className={labelClass}>Exercise</span>
              {editMode ? (
                <input
                  className={editInputClass}
                  value={d?.name ?? ex.name}
                  onChange={(e) =>
                    onDraftChange(ex.id, { name: e.target.value })
                  }
                />
              ) : (
                <span className="font-semibold">{ex.name}</span>
              )}
            </div>

            <div
              className={clsx(
                cellClass,
                "col-span-1 flex flex-col items-center justify-center"
              )}
            >
              <span className={labelClass}>Sets</span>
              {editMode ? (
                <input
                  className={clsx(editInputClass, "w-10 text-center")}
                  value={d?.sets ?? String(ex.sets)}
                  onChange={(e) =>
                    onDraftChange(ex.id, {
                      sets: numericOnly(e.target.value),
                    })
                  }
                />
              ) : (
                <span>{ex.sets}</span>
              )}
            </div>

            <div className="flex items-center justify-center text-textSecondary">
              ×
            </div>

            <div
              className={clsx(
                cellClass,
                "col-span-1 flex flex-col items-center justify-center"
              )}
            >
              <span className={labelClass}>Reps</span>
              {editMode ? (
                <input
                  className={clsx(editInputClass, "w-10 text-center")}
                  value={d?.reps ?? String(ex.reps)}
                  onChange={(e) =>
                    onDraftChange(ex.id, {
                      reps: numericOnly(e.target.value),
                    })
                  }
                />
              ) : (
                <span>{ex.reps}</span>
              )}
            </div>

            <div className="flex items-center justify-center text-textSecondary">
              @
            </div>

            <div
              className={clsx(
                cellClass,
                "col-span-1 flex flex-col items-center justify-center"
              )}
            >
              <span className={labelClass}>Weight</span>
              {editMode ? (
                <span className="inline-flex items-baseline justify-center">
                  <input
                    className={clsx(editInputClass, "w-12 text-right")}
                    value={d?.weight ?? ex.weight?.toString() ?? ""}
                    onChange={(e) =>
                      onDraftChange(ex.id, {
                        weight: numericOnly(e.target.value),
                      })
                    }
                  />
                  <span className="ml-0.5 text-xs text-textSecondary">kg</span>
                </span>
              ) : (
                <ValueWithUnit value={ex.weight} unit="kg" />
              )}
            </div>

            <div
              className={clsx(
                cellClass,
                "col-span-1 flex flex-col items-center justify-center"
              )}
            >
              <span className={labelClass}>Rest</span>
              {editMode ? (
                <span className="inline-flex items-baseline justify-center">
                  <input
                    className={clsx(editInputClass, "w-10 text-right")}
                    value={d?.restTimeSec ?? ex.restTimeSec?.toString() ?? ""}
                    onChange={(e) =>
                      onDraftChange(ex.id, {
                        restTimeSec: numericOnly(e.target.value),
                      })
                    }
                  />
                  <span className="ml-0.5 text-xs text-textSecondary">s</span>
                </span>
              ) : (
                <ValueWithUnit value={ex.restTimeSec} unit="s" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
