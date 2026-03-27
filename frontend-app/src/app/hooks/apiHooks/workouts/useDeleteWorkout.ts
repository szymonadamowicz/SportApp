"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { deleteWorkoutApi } from "@/api/workouts.api";
import { Workout } from "@/types/workout/workout";
import { Ctx } from "@/types/components/ctx";

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string, Ctx>({
    mutationFn: async (id) => {
      return await deleteWorkoutApi(id);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });
      const previous = queryClient.getQueryData<Workout[]>(workoutsKeys.all);

      queryClient.setQueryData<Workout[]>(workoutsKeys.all, (old) =>
        old ? old.filter((w) => w.id !== id) : old,
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
