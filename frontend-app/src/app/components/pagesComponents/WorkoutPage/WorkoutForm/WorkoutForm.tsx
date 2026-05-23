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
import { AnimatePresence, motion } from "framer-motion";
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
              <motion.div
                layout
                className="flex flex-wrap items-center justify-end gap-3"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={vm.handleStartWorkout}
                  className="rf-action-button inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-2.5 text-sm font-semibold text-bgMain shadow-[0_10px_24px_rgba(34,197,94,0.26)] transition hover:brightness-95 active:scale-[0.99]"
                >
                  <ChevronRight size={16} />
                  {vm.startButtonLabel}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className={`rf-action-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
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
                      className="rf-action-button inline-flex items-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:bg-white/5"
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
                  className="rf-action-button inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:border-borderStrong hover:bg-white/5 hover:text-textPrimary"
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
