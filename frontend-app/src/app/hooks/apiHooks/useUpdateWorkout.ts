"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Workout, UpdateWorkoutPayload } from "@/types/workout/workout";
import { patchExerciseInWorkouts } from "@/api/cache/workouts.cache";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { updateWorkoutApi } from "@/api/apiMock/workoutsApi.update";

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateWorkoutPayload,
    Error,
    UpdateWorkoutPayload,
    { previous?: Workout[] }
  >({
    mutationFn: updateWorkoutApi,

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });

      const previous = queryClient.getQueryData<Workout[]>(workoutsKeys.all);

      queryClient.setQueryData<Workout[]>(workoutsKeys.all, (old) =>
        old
          ? patchExerciseInWorkouts(
              old,
              payload.workoutId,
              payload.exerciseId,
              payload.patch
            )
          : old
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
