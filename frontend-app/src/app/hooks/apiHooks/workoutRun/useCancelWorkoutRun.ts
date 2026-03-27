"use client";

import { workoutRunKeys } from "@/api/keys/workoutRun.keys";
import { progressKeys } from "@/api/keys/progress.keys";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { cancelWorkoutRunApi } from "@/api/workoutRun.api";
import { clearLiveActiveWorkoutRun } from "@/state/activeWorkoutRun.live";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCancelWorkoutRun = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { runId: string; workoutId?: string }>({
    mutationFn: ({ runId }) => cancelWorkoutRunApi(runId),
    onSuccess: (_, variables) => {
      if (variables.workoutId) {
        queryClient.setQueryData(workoutRunKeys.active(variables.workoutId), null);
      }
      queryClient.setQueryData(workoutRunKeys.latestActive(), null);
      clearLiveActiveWorkoutRun(variables.runId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutsKeys.all });
      queryClient.invalidateQueries({ queryKey: progressKeys.all("all") });
      queryClient.invalidateQueries({ queryKey: progressKeys.all("week") });
    },
  });
};
