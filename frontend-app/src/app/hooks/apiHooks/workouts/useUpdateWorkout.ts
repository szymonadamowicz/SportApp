"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { updateWorkoutApi } from "@/api/apiMock/workouts/workouts.api";
import { Workout, UpdateWorkoutPayload } from "@/types/workout/workout";

type Ctx = {
  previous?: Workout[];
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateWorkoutPayload, Ctx>({
    mutationFn: updateWorkoutApi,

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: workoutsKeys.all });

      const previous = queryClient.getQueryData<Workout[]>(workoutsKeys.all);

      queryClient.setQueryData<Workout[]>(workoutsKeys.all, (old) => {
        if (!old) return old;

        switch (payload.kind) {
          case "workout":
            return old.map((w) =>
              w.id === payload.workoutId ? { ...w, ...payload.patch } : w
            );

          case "exercise":
            return old.map((w) =>
              w.id === payload.workoutId
                ? {
                    ...w,
                    exercises: w.exercises.map((ex) =>
                      ex.id === payload.exerciseId
                        ? { ...ex, ...payload.patch }
                        : ex
                    ),
                  }
                : w
            );

          case "createExercise":
            return old.map((w) =>
              w.id === payload.workoutId
                ? {
                    ...w,
                    exercises: [...w.exercises, ...payload.exercises],
                  }
                : w
            );

          default:
            return old;
        }
      });

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(workoutsKeys.all, ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutsKeys.all });
    },
  });
};
