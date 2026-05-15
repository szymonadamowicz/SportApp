"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { useWorkoutFormVM } from "./WorkoutFormVM";
import { WorkoutExercisesSection } from "./sections/WorkoutExercisesSection";
import { useDeleteWorkout } from "@/hooks/apiHooks/workouts/useDeleteWorkout";
import {
  formatTimeDiff,
  isSameDay,
  formatViewTime,
} from "@/helpers/utils/calculate/workoutTime";
import { WorkoutFormProps } from "@/types/pages/workoutPage";
import { ChevronRight, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function WorkoutForm({ workout, onClose }: WorkoutFormProps) {
  const vm = useWorkoutFormVM(workout);
  const deleteMutation = useDeleteWorkout();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isToday = isSameDay(workout.scheduledAt, vm.now);
  const timeDiff = formatTimeDiff(workout.scheduledAt, vm.now);
  const hasMuscleGroups = Array.isArray(workout.muscleGroups);
  const focusLabel = hasMuscleGroups
    ? (workout.muscleGroups?.[0] ?? "Workout")
    : (workout.mainFocus ?? "Workout");

  let desc = `${focusLabel}, `;
  if (timeDiff === "missed") {
    desc += formatViewTime(workout.scheduledAt);
  } else if (isToday) {
    desc += `today, ${timeDiff}`;
  } else {
    desc += timeDiff;
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(workout.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <>
      <InfoPanel
        title={workout.title}
        desc={desc}
        showButton={{
          label: vm.editMode
            ? vm.hasChanges
              ? "Save changes"
              : "Cancel"
            : "Edit exercises",
          onClick: () => {
            if (!vm.editMode) {
              vm.enterExercisesEdit();
              return;
            }

            if (vm.hasChanges) {
              vm.saveAllChanges();
            } else {
              vm.cancelEdit();
            }
          },
        }}
        secondaryButton={
          !vm.hasChanges
            ? {
                label: "Edit workout",
                onClick: vm.handleEditWorkout,
              }
            : {
                label: "Discard changes",
                onClick: vm.cancelEdit,
              }
        }
          actions={
            !vm.editMode ? (
              <>
                <button
                  type="button"
                  onClick={vm.handleStartWorkout}
                  className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-2.5 text-sm font-semibold text-bgMain shadow-[0_10px_24px_rgba(34,197,94,0.26)] transition hover:brightness-95 active:scale-[0.99]"
                >
                  <ChevronRight size={16} />
                  {vm.startButtonLabel}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    showDeleteConfirm
                      ? "border border-red-500/40 bg-red-500/15 text-red-300"
                      : "border border-red-500/25 bg-red-500/8 text-red-300 hover:bg-red-500/14"
                  }`}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                  {showDeleteConfirm ? "Confirm delete" : "Delete"}
                </button>

                {showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:border-borderStrong hover:bg-white/5 hover:text-textPrimary"
                  aria-label="Close workout details"
                  title="Close workout details"
                >
                  <X size={16} />
                  Close
                </button>
              </>
            ) : undefined
          }
      >
        <WorkoutExercisesSection
          workout={vm.workout ?? workout}
          editMode={vm.editMode}
          draft={vm.draft}
          errors={vm.exerciseErrors}
          onDraftChange={vm.updateDraft}
          onPress={vm.handleEditWorkout}
          onAddExercise={vm.addExercise}
          onRemoveExercise={vm.removeExercise}
        />
      </InfoPanel>
    </>
  );
}
