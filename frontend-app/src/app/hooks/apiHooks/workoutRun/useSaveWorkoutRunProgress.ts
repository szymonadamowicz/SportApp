"use client";

import { workoutRunKeys } from "@/api/keys/workoutRun.keys";
import { mapWorkoutRunStartDto } from "@/api/mappers/workout/workoutRunMapper";
import { saveWorkoutRunProgressApi } from "@/api/workoutRun.api";
import {
  SaveWorkoutRunProgressDto,
  WorkoutRunStart,
} from "@/types/workout/workoutRun";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSaveWorkoutRunProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutRunStart,
    Error,
    { runId: string; payload: SaveWorkoutRunProgressDto }
  >({
    mutationFn: async ({ runId, payload }) => {
      const dto = await saveWorkoutRunProgressApi(runId, payload);
      return mapWorkoutRunStartDto(dto);
    },
    onSuccess: (run) => {
      queryClient.setQueryData(workoutRunKeys.active(run.workoutId), run);
    },
  });
};
