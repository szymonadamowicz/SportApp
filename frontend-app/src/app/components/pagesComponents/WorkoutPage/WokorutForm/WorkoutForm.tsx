"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { useWorkoutFormVM } from "./WorkoutFormVM";
import { WorkoutExercisesSection } from "./sections/WorkoutExercisesSection";
import {
  formatTimeDiff,
  isSameDay,
} from "@/helpers/utils/calculate/workoutTime";
import { WorkoutFormProps } from "@/types/pages/workoutPage";

export default function WorkoutForm({ workout }: WorkoutFormProps) {
  const vm = useWorkoutFormVM(workout);

  const isToday = isSameDay(workout.scheduledAt, vm.now);

  const desc = `${workout.mainFocus}, ${
    isToday ? "today" : "in"
  }: ${formatTimeDiff(workout.scheduledAt, vm.now)}`;

  return (
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
          }
        },
      }}
      secondaryButton={
        !vm.hasChanges ? {
          label: "Edit workout",
          onClick: vm.handleEditWorkout,
        } : {
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
  );
}
