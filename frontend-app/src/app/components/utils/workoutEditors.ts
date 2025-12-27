import { ExerciseUpdate, Workout } from "@/types/workout";

export const updateExerciseInWorkout = (
  workout: Workout,
  exerciseId: string,
  changes: ExerciseUpdate
): Workout => ({
  ...workout,
  exercises: workout.exercises.map((ex) =>
    ex.id === exerciseId ? { ...ex, ...changes } : ex
  ),
});
