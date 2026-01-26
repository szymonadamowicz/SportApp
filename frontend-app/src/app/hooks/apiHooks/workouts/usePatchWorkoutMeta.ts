"use client";

import { mapWorkoutDTO } from "@/api/mappers/workout/workoutMapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { patchWorkoutMetaApi } from "@/api/workouts.api";
import { Workout } from "@/types/workout/workout";
import { Ctx } from "@/types/components/cts";

export const usePatchWorkoutMeta = () => {
  const queryClient = useQueryClient();

  return useMutation<Workout, Error, Workout, Ctx>({
    mutationFn: async (workout) => {
      const updated = await patchWorkoutMetaApi(workout);
      return mapWorkoutDTO(updated);
    },

    onMutate: async (nextWorkout) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });
      const previous = queryClient.getQueryData<Workout[]>(workoutsKeys.all);

      queryClient.setQueryData<Workout[]>(workoutsKeys.all, (old) =>
        old
          ? old.map((w) =>
              w.id === nextWorkout.id ? { ...w, ...nextWorkout } : w,
            )
          : old,
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
