"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { mapWorkoutDTO } from "@/api/mappers/workout/workoutMapper";
import {
  optimisticAddWorkout,
  rollbackWorkouts,
} from "@/api/cache/workouts.cache";
import { Workout } from "@/types/workout/workout";
import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { createWorkoutApi } from "@/api/apiMock/workouts/workouts.api";

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Workout,
    Error,
    WorkoutDTO,
    { previous?: Workout[]; optimisticId: string }
  >({
    mutationFn: async (dto) => {
      const created = await createWorkoutApi({ workout: dto });
      return mapWorkoutDTO(created);
    },

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });

      const optimisticId = `optimistic-${Date.now()}`;

      const optimisticWorkout = mapWorkoutDTO({
        ...dto,
        id: optimisticId,
      });

      const previous = optimisticAddWorkout(queryClient, optimisticWorkout);

      return { previous, optimisticId };
    },

    onError: (_err, _payload, ctx) => {
      rollbackWorkouts(queryClient, ctx?.previous);
    },

    onSuccess: (created, _payload, ctx) => {
      queryClient.setQueryData<Workout[]>(workoutsKeys.all, (old) =>
        old
          ? old.map((w) => (w.id === ctx.optimisticId ? created : w))
          : [created]
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutsKeys.all });
    },
  });
};
