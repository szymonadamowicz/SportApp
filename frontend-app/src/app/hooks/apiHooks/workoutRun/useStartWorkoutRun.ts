"use client";

import { workoutRunKeys } from "@/api/keys/workoutRun.keys";
import { mapWorkoutRunStartDto } from "@/api/mappers/workout/workoutRunMapper";
import { startWorkoutRunApi } from "@/api/workoutRun.api";
import { setLiveActiveWorkoutRun } from "@/state/activeWorkoutRun.live";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkoutRunStart } from "@/types/workout/workoutRun";

export const useStartWorkoutRun = () => {
  const queryClient = useQueryClient();

  return useMutation<WorkoutRunStart, Error, string>({
    mutationFn: async (workoutId: string) => {
      const dto = await startWorkoutRunApi(workoutId);
      return mapWorkoutRunStartDto(dto);
    },
    onSuccess: (run) => {
      queryClient.setQueryData(workoutRunKeys.active(run.workoutId), run);
      queryClient.setQueryData(workoutRunKeys.latestActive(), run);
      setLiveActiveWorkoutRun(run);
    },
  });
};
