"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Workout } from "@/types/workout/workout";
import { addWorkoutToWorkouts } from "@/api/cache/workouts.cache";
import { mapWorkoutDTO } from "@/api/mappers/workoutMapper";
import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { createWorkoutApi } from "@/api/apiMock/workoutsApi.create";
import { workoutsKeys } from "@/api/keys/workouts.keys";

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<Workout, Error, WorkoutDTO, { previous?: Workout[] }>({
    mutationFn: async (dto) => {
      const created = await createWorkoutApi({ workout: dto });
      return mapWorkoutDTO(created);
    },

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });

      const previous = queryClient.getQueryData<Workout[]>(workoutsKeys.all);

      const optimisticWorkout = mapWorkoutDTO(dto);

      queryClient.setQueryData<Workout[]>(workoutsKeys.all, (old) =>
        old ? addWorkoutToWorkouts(old, optimisticWorkout) : [optimisticWorkout]
      );

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(workoutsKeys.all, ctx.previous);
      }
    },
  });
};
