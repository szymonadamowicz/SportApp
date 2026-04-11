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
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function WorkoutForm({ workout }: WorkoutFormProps) {
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

      {!vm.editMode && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleDelete}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              text-sm font-semibold transition
              ${
                showDeleteConfirm
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
              }
            `}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={16} />
            {showDeleteConfirm ? "Confirm Delete" : "Delete Workout"}
          </button>
          {showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold
                bg-gray-600/10 hover:bg-gray-600/20 text-gray-400
                border border-gray-600/30 transition"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </>
  );
}
