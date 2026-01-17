"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { useWorkoutFormVM } from "./WorkoutFormVM";
import { WorkoutExercisesSection } from "./sections/WorkoutExercisesSection";
import {
  formatTimeDiff,
  isSameDay,
} from "@/helpers/utils/calculate/workoutTime";
import { WorkoutFormProps } from "@/types/pages/workoutPage";

export default function WorkoutForm({
  workout,
  setEditWorkoutId,
}: WorkoutFormProps) {
  const vm = useWorkoutFormVM(workout, setEditWorkoutId);


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
