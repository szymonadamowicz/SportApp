"use client";

import EmptyState from "@/components/EmptyState/EmptyState";
import {
  cellClass,
  editInputClass,
  labelClass,
  rowClass,
} from "@/helpers/ui/workoutExercisesStyles";
import { WorkoutExercisesSectionProps } from "@/types/pages/workoutPage";
import clsx from "clsx";
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
  const desktopGridClass = editMode
    ? "md:grid-cols-[1fr_64px_20px_64px_20px_88px_64px_40px]"
    : "md:grid-cols-[1fr_64px_20px_64px_20px_88px_64px]";

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
        const draftExercise = editMode ? draft[id] : undefined;
        const original = workout.exercises.find((exercise) => exercise.id === id);
        const fieldErrors = errors?.[id];
        const view = editMode ? draftExercise : original;

        if (!view) return null;

        const renderName = () =>
          editMode ? (
            <>
              <input
                className={clsx(
                  editInputClass,
                  "w-full",
                  fieldErrors?.name && "border-red-400",
                )}
                value={view.name}
                onChange={(event) =>
                  onDraftChange(id, { name: event.target.value })
                }
              />
              <div className="mt-1 min-h-[14px] text-xs text-red-400">
                {fieldErrors?.name ?? ""}
              </div>
            </>
          ) : (
            <span className="block break-words text-base font-semibold leading-snug text-textPrimary sm:text-lg">
              {view.name}
            </span>
          );

        return (
          <div key={id}>
            <div className="flex flex-col gap-3 rounded-xl border border-borderSoft bg-bgMain/40 px-3 py-3 sm:px-4 md:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className={labelClass}>Exercise</span>
                  {renderName()}
                </div>

                {editMode && onRemoveExercise && (
                  <button
                    type="button"
                    onClick={() => onRemoveExercise(id)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-borderSoft text-textSecondary transition hover:bg-red-400/10 hover:text-red-400"
                    aria-label="Remove exercise"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
                <div className={clsx(cellClass, "min-w-0 rounded-xl bg-bgHighlight/25 p-3")}>
                  <span className={labelClass}>Sets</span>
                  {editMode ? (
                    <>
                      <input
                        className={clsx(
                          editInputClass,
                          "mt-1 w-full",
                          fieldErrors?.sets && "border-red-400",
                        )}
                        value={view.sets}
                        onChange={(event) =>
                          onDraftChange(id, {
                            sets: Number(event.target.value),
                          })
                        }
                      />
                      <div className="mt-1 min-h-[14px] text-xs text-red-400">
                        {fieldErrors?.sets ?? ""}
                      </div>
                    </>
                  ) : (
                    <span className="mt-1 break-words text-lg font-semibold leading-tight">
                      {view.sets}
                    </span>
                  )}
                </div>

                <div className={clsx(cellClass, "min-w-0 rounded-xl bg-bgHighlight/25 p-3")}>
                  <span className={labelClass}>Reps</span>
                  {editMode ? (
                    <>
                      <input
                        className={clsx(
                          editInputClass,
                          "mt-1 w-full",
                          fieldErrors?.reps && "border-red-400",
                        )}
                        value={view.reps}
                        onChange={(event) =>
                          onDraftChange(id, {
                            reps: Number(event.target.value),
                          })
                        }
                      />
                      <div className="mt-1 min-h-[14px] text-xs text-red-400">
                        {fieldErrors?.reps ?? ""}
                      </div>
                    </>
                  ) : (
                    <span className="mt-1 break-words text-lg font-semibold leading-tight">
                      {view.reps}
                    </span>
                  )}
                </div>

                <div className={clsx(cellClass, "min-w-0 rounded-xl bg-bgHighlight/25 p-3")}>
                  <span className={labelClass}>Weight</span>
                  {editMode ? (
                    <input
                      className={clsx(editInputClass, "mt-1 w-full")}
                      value={view.weight ?? ""}
                      onChange={(event) =>
                        onDraftChange(id, {
                          weight: Number(event.target.value) || undefined,
                        })
                      }
                    />
                  ) : (
                    <span className="mt-1 break-words text-lg font-semibold leading-tight">
                      {view.weight ?? "-"}
                    </span>
                  )}
                </div>

                <div className={clsx(cellClass, "min-w-0 rounded-xl bg-bgHighlight/25 p-3")}>
                  <span className={labelClass}>Rest</span>
                  {editMode ? (
                    <input
                      className={clsx(editInputClass, "mt-1 w-full")}
                      value={view.restTimeSec ?? ""}
                      onChange={(event) =>
                        onDraftChange(id, {
                          restTimeSec: Number(event.target.value) || undefined,
                        })
                      }
                    />
                  ) : (
                    <span className="mt-1 break-words text-lg font-semibold leading-tight">
                      {view.restTimeSec ?? "-"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className={clsx(
                rowClass,
                "hidden items-start gap-x-2 md:grid",
                desktopGridClass,
              )}
            >
              <div className={clsx(cellClass, "flex flex-col")}>
                <span className={labelClass}>Exercise</span>
                {renderName()}
              </div>

              <div className={clsx(cellClass, "flex flex-col items-center")}>
                <span className={labelClass}>Sets</span>
                {editMode ? (
                  <>
                    <input
                      className={clsx(
                        editInputClass,
                        "w-14 text-center",
                        fieldErrors?.sets && "border-red-400",
                      )}
                      value={view.sets}
                      onChange={(event) =>
                        onDraftChange(id, {
                          sets: Number(event.target.value),
                        })
                      }
                    />
                    <div className="mt-1 min-h-[14px] text-center text-xs text-red-400">
                      {fieldErrors?.sets ?? ""}
                    </div>
                  </>
                ) : (
                  <span>{view.sets}</span>
                )}
              </div>

              <div className="flex items-center justify-center text-textSecondary">
                x
              </div>

              <div className={clsx(cellClass, "flex flex-col items-center")}>
                <span className={labelClass}>Reps</span>
                {editMode ? (
                  <>
                    <input
                      className={clsx(
                        editInputClass,
                        "w-14 text-center",
                        fieldErrors?.reps && "border-red-400",
                      )}
                      value={view.reps}
                      onChange={(event) =>
                        onDraftChange(id, {
                          reps: Number(event.target.value),
                        })
                      }
                    />
                    <div className="mt-1 min-h-[14px] text-center text-xs text-red-400">
                      {fieldErrors?.reps ?? ""}
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
                    onChange={(event) =>
                      onDraftChange(id, {
                        weight: Number(event.target.value) || undefined,
                      })
                    }
                  />
                ) : (
                  <span>{view.weight ?? "-"}</span>
                )}
              </div>

              <div className={clsx(cellClass, "flex flex-col items-center")}>
                <span className={labelClass}>Rest</span>
                {editMode ? (
                  <input
                    className={clsx(editInputClass, "w-16 text-right")}
                    value={view.restTimeSec ?? ""}
                    onChange={(event) =>
                      onDraftChange(id, {
                        restTimeSec: Number(event.target.value) || undefined,
                      })
                    }
                  />
                ) : (
                  <span>{view.restTimeSec ?? "-"}</span>
                )}
              </div>

              {editMode && onRemoveExercise && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onRemoveExercise(id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-textSecondary transition hover:bg-red-400/10 hover:text-red-400"
                    aria-label="Remove exercise"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {editMode && onAddExercise && (
        <button
          type="button"
          onClick={onAddExercise}
          className="
            inline-flex min-h-11 w-full items-center justify-center gap-2
            rounded-full border border-[rgba(34,197,94,0.35)]
            bg-[rgba(34,197,94,0.10)] px-4 py-2 text-sm font-medium
            text-accent transition
            hover:border-[rgba(34,197,94,0.55)] hover:bg-[rgba(34,197,94,0.18)]
            active:scale-[0.98] sm:w-auto
          "
        >
          <Plus size={16} />
          Add exercise
        </button>
      )}
    </div>
  );
};
