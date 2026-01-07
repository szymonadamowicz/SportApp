import { Workout, ExerciseUpdate } from "@/types/workout/workout";

export const patchExerciseInWorkouts = (
  workouts: Workout[],
  workoutId: string,
  exerciseId: string,
  patch: ExerciseUpdate
): Workout[] =>
  workouts.map((w) =>
    w.id === workoutId
      ? {
          ...w,
          exercises: w.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, ...patch } : ex
          ),
        }
      : w
  );

export const addWorkoutToWorkouts = (
  workouts: Workout[],
  workout: Workout
): Workout[] => [workout, ...workouts];
