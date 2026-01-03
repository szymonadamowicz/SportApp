"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Workout, ExerciseUpdate, UpdateWorkoutPayload } from "@/types/workout";

const updateWorkoutApi = async (
  payload: UpdateWorkoutPayload
): Promise<UpdateWorkoutPayload> => {
  await new Promise((r) => setTimeout(r, 100));
  return payload;
};

const applyExercisePatch = (
  workout: Workout,
  exerciseId: string,
  patch: ExerciseUpdate
): Workout => ({
  ...workout,
  exercises: workout.exercises.map((ex) =>
    ex.id === exerciseId ? { ...ex, ...patch } : ex
  ),
});

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
      await queryClient.cancelQueries({ queryKey: ["workouts"] });

      const previous = queryClient.getQueryData<Workout[]>(["workouts"]);

      queryClient.setQueryData<Workout[]>(["workouts"], (old) =>
        old
          ? old.map((w) =>
              w.id === payload.workoutId
                ? applyExercisePatch(w, payload.exerciseId, payload.patch)
                : w
            )
          : old
      );

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["workouts"], ctx.previous);
      }
    },
  });
};
