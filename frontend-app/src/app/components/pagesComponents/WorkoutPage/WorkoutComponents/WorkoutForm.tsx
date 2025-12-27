import InfoPanel from "@/components/InfoPanelComponents/InfoPanel";
import { updateExerciseInWorkout } from "@/components/utils/workoutEditors";
import { formatTimeDiff, isSameDay } from "@/components/utils/workoutTime";
import { ExerciseUpdate, Workout, WorkoutFormProps } from "@/types/workout";
import { useEffect, useState } from "react";

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ workout }) => {
  const [editMode, setEditMode] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [draftWorkout, setDraftWorkout] = useState<Workout | null>(
    workout ?? null
  );

  useEffect(() => {
    setEditMode(false);
    setChangesMade(false);
    setDraftWorkout(workout ?? null);
  }, [workout]);

  const updateExercise = (exerciseId: string, changes: ExerciseUpdate) => {
    setDraftWorkout((prev) =>
      prev ? updateExerciseInWorkout(prev, exerciseId, changes) : prev
    );
    setChangesMade(true);
  };

  const workoutDesc = draftWorkout
    ? `${draftWorkout.muscleGroup}, ${
        isSameDay(draftWorkout.scheduledAt, new Date()) ? "today" : "in"
      }: ${formatTimeDiff(draftWorkout.scheduledAt)}`
    : undefined;

  return (
    <div className="w-full">
      {workout && (
        <div key={workout.id} className="space-y-6">
          <div className="mt-8">
            <InfoPanel
              title={draftWorkout ? draftWorkout.title : "Workout Exercises"}
              desc={workoutDesc}
              items={draftWorkout ? [draftWorkout] : []}
              variant={!editMode ? "exercises" : "exercise_edit"}
              showButton={{
                label: editMode
                  ? changesMade
                    ? "Save Changes"
                    : "Cancel"
                  : "Edit Workout",
                onClick: () => {
                  if (editMode && !changesMade) {
                    setDraftWorkout(workout);
                  }
                  setEditMode((v) => !v);
                },
              }}
              onUpdateExercise={updateExercise}
            />
          </div>
        </div>
      )}
      {!workout && (
        <div className="text-center py-12">
          <p className="text-lg text-textSecondary">
            Select a workout to view details
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkoutForm;
