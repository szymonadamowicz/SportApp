import { QueryClient } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { Workout } from "@/types/workout/workout";

const addWorkoutToWorkouts = (
  workouts: Workout[],
  workout: Workout,
): Workout[] => [workout, ...workouts];

export const optimisticAddWorkout = (
  client: QueryClient,
  workout: Workout,
): Workout[] | undefined => {
  const previous = client.getQueryData<Workout[]>(workoutsKeys.all);

  client.setQueryData<Workout[]>(workoutsKeys.all, (old) =>
    old ? addWorkoutToWorkouts(old, workout) : [workout],
  );

  return previous;
};

export const rollbackWorkouts = (client: QueryClient, previous?: Workout[]) => {
  if (previous) {
    client.setQueryData(workoutsKeys.all, previous);
  }
};
