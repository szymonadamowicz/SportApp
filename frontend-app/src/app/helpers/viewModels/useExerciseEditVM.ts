import {
  DraftExercise,
  Workout,
  ExerciseUpdate,
} from "@/types/workout";
import {
  toDraftExercise,
  getExerciseUpdate,
} from "@/helpers/utils/workoutDraftChanged";

export const createWorkoutEditorVM = (workout?: Workout | null) => {
  if (!workout || !Array.isArray(workout.exercises)) {
    return {
      initialDraft: {} as Record<string, DraftExercise>,
      computeUpdate: () => null as ExerciseUpdate | null,
    };
  }

  const initialDraft: Record<string, DraftExercise> = {};

  workout.exercises.forEach((ex) => {
    initialDraft[ex.id] = toDraftExercise(ex);
  });

  const computeUpdate = (
    exerciseId: string,
    draft: Record<string, DraftExercise>
  ): ExerciseUpdate | null => {
    const original = workout.exercises.find((e) => e.id === exerciseId);
    const d = draft[exerciseId];
    if (!original || !d) return null;
    return getExerciseUpdate(original, d);
  };

  return {
    initialDraft,
    computeUpdate,
  };
};
