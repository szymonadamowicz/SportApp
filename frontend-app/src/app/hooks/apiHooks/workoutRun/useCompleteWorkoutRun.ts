"use client";

import { workoutRunKeys } from "@/api/keys/workoutRun.keys";
import { mapWorkoutRunSummaryDto } from "@/api/mappers/workout/workoutRunMapper";
import { progressKeys } from "@/api/keys/progress.keys";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { completeWorkoutRunApi } from "@/api/workoutRun.api";
import {
  CompleteWorkoutRunDto,
  WorkoutRunSummary,
} from "@/types/workout/workoutRun";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCompleteWorkoutRun = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutRunSummary,
    Error,
    { runId: string; payload: CompleteWorkoutRunDto }
  >({
    mutationFn: async ({ runId, payload }) => {
      const dto = await completeWorkoutRunApi(runId, payload);
      return mapWorkoutRunSummaryDto(dto);
    },
    onSuccess: (summary) => {
      queryClient.setQueryData(workoutRunKeys.active(summary.workoutId), null);
      queryClient.setQueryData(workoutRunKeys.latestActive(), null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: workoutsKeys.all });
      queryClient.invalidateQueries({ queryKey: workoutRunKeys.all });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: progressKeys.all("all") });
      queryClient.invalidateQueries({ queryKey: progressKeys.all("week") });
    },
  });
};
