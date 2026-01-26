"use client";

import { mapWorkoutDTO } from "@/api/mappers/workout/workoutMapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { putWorkoutStructureApi } from "@/api/workouts.api";
import { Workout } from "@/types/workout/workout";
import { Ctx } from "@/types/components/cts";

export const usePutWorkoutStructure = () => {
  const queryClient = useQueryClient();

  return useMutation<Workout, Error, Workout, Ctx>({
    mutationFn: async (workout) => {
      const updated = await putWorkoutStructureApi(workout);
      return mapWorkoutDTO(updated);
    },

    onMutate: async (nextWorkout) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });
      const previous = queryClient.getQueryData<Workout[]>(workoutsKeys.all);

      queryClient.setQueryData<Workout[]>(workoutsKeys.all, (old) =>
        old ? old.map((w) => (w.id === nextWorkout.id ? nextWorkout : w)) : old,
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(workoutsKeys.all, ctx.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutsKeys.all });
    },
  });
};
