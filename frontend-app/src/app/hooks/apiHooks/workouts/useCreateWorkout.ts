"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { mapWorkoutDTO } from "@/api/mappers/workout/workoutMapper";
import {
  optimisticAddWorkout,
  rollbackWorkouts,
} from "@/api/cache/workouts.cache";
import { Workout } from "@/types/workout/workout";
import { createWorkoutApi } from "@/api/apiMock/workouts/workouts.api";

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Workout,
    Error,
    Workout,
    { previous?: Workout[]; optimisticId: string }
  >({
    mutationFn: async (w) => {
      const created = await createWorkoutApi({ workout: w });
      return mapWorkoutDTO(created);
    },

    onMutate: async (w) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });

      const optimisticId = `optimistic-${Date.now()}`;

      const optimisticWorkout = {
        ...w,
        id: optimisticId,
      };

      const previous = optimisticAddWorkout(queryClient, optimisticWorkout);

      return { previous, optimisticId };
    },

    onError: (_err, _payload, ctx) => {
      rollbackWorkouts(queryClient, ctx?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutsKeys.all });
    },
  });
};
