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

  const desc = `${workout.mainFocus}, ${
    isSameDay(workout.scheduledAt, new Date()) ? "today" : "in"
  }: ${formatTimeDiff(workout.scheduledAt)}`;

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
          } else {
            vm.cancelEdit();
          }
        },
      }}
      secondaryButton={{
        label: "Edit workout",
        onClick: vm.editWorkoutAction,
      }}
    >
      <WorkoutExercisesSection
        workout={workout}
        editMode={vm.editMode}
        draft={vm.draft}
        errors={vm.exerciseErrors}
        onDraftChange={vm.updateDraft}
        onPress={vm.editWorkoutAction}
        onAddExercise={vm.addExercise}
        onRemoveExercise={vm.removeExercise}
      />
    </InfoPanel>
  );
}
