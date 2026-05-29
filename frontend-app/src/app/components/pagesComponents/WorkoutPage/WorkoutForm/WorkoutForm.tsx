"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { useWorkoutFormVM } from "./WorkoutFormVM";
import { WorkoutFormAnalysesSection } from "./sections/WorkoutFormAnalysesSection";
import { WorkoutExercisesSection } from "./sections/WorkoutExercisesSection";
import { useDeleteWorkout } from "@/hooks/apiHooks/workouts/useDeleteWorkout";
import {
  formatTimeDiff,
  isSameDay,
  formatViewTime,
} from "@/helpers/utils/calculate/workoutTime";
import { WorkoutFormProps } from "@/types/pages/workoutPage";
import { ChevronRight, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getFriendlyErrorMessage } from "@/api/apiError";

export default function WorkoutForm({ workout, onClose }: WorkoutFormProps) {
  const vm = useWorkoutFormVM(workout);
  const deleteMutation = useDeleteWorkout();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    setDeleteError(null);

    if (showDeleteConfirm) {
      try {
        await deleteMutation.mutateAsync(workout.id);
        onClose();
      } catch (error) {
        setDeleteError(
          getFriendlyErrorMessage(
            error,
            "Could not delete this training. Please try again.",
          ),
        );
      }
      return;
    }

    setShowDeleteConfirm(true);
  };

  return (
    <>
      <InfoPanel
        title={workout.title}
        desc={desc}
        showButton={{
          label: vm.editMode
            ? vm.hasChanges
              ? vm.isSaving
                ? "Saving..."
                : "Save changes"
              : "Cancel"
            : "Edit exercises",
                onClick: () => {
                  if (!vm.editMode) {
                    vm.enterExercisesEdit();
              return;
            }

                  if (vm.hasChanges) {
                    void vm.saveAllChanges();
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
              <motion.div
                layout
                className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={vm.handleStartWorkout}
                  className="rf-action-button inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-2.5 text-sm font-semibold text-bgMain shadow-[0_10px_24px_rgba(34,197,94,0.26)] transition hover:brightness-95 active:scale-[0.99] sm:w-auto"
                >
                  <ChevronRight size={16} />
                  {vm.startButtonLabel}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className={`rf-action-button inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:w-auto ${
                    showDeleteConfirm
                      ? "border border-red-500/40 bg-red-500/15 text-red-300"
                      : "border border-red-500/25 bg-red-500/8 text-red-300 hover:bg-red-500/14"
                  }`}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                  {showDeleteConfirm ? "Confirm delete" : "Delete"}
                </button>

                <AnimatePresence initial={false}>
                  {showDeleteConfirm && (
                    <motion.button
                      key="cancel-delete"
                      layout
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rf-action-button inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:bg-white/5 sm:w-auto"
                      initial={{ opacity: 0, x: -8, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                      Cancel
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={onClose}
                  className="rf-action-button inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:border-borderStrong hover:bg-white/5 hover:text-textPrimary sm:w-auto"
                  aria-label="Close workout details"
                  title="Close workout details"
                >
                  <X size={16} />
                  Close
                </button>
              </motion.div>
            ) : undefined
          }
      >
        {(vm.actionError || deleteError) && (
          <p className="mb-4 rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">
            {vm.actionError ?? deleteError}
          </p>
        )}

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

        {!vm.editMode && <WorkoutFormAnalysesSection workoutId={workout.id} />}
      </InfoPanel>
    </>
  );
}
