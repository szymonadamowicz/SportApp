"use client";

import { workoutRunKeys } from "@/api/keys/workoutRun.keys";
import { mapWorkoutRunStartDto } from "@/api/mappers/workout/workoutRunMapper";
import {
  getActiveWorkoutRunApi,
  getLatestActiveWorkoutRunApi,
} from "@/api/workoutRun.api";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLiveActiveWorkoutRun } from "@/state/activeWorkoutRun.live";
import { WorkoutRunStart } from "@/types/workout/workoutRun";
import { useQuery } from "@tanstack/react-query";

export const useActiveWorkoutRun = (workoutId?: string) => {
  const { isAuthenticated, isReady } = useAuth();

  const query = useQuery<WorkoutRunStart | null>({
    queryKey: workoutId ? workoutRunKeys.active(workoutId) : workoutRunKeys.all,
    queryFn: async () => {
      if (!workoutId) return null;
      const dto = await getActiveWorkoutRunApi(workoutId);
      if (!dto) return null;
      return mapWorkoutRunStartDto(dto);
    },
    enabled: Boolean(workoutId) && isReady && isAuthenticated,
    staleTime: 15_000,
    refetchOnMount: true,
  });

  if (!isReady || !isAuthenticated) {
    return {
      activeRun: null,
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: query.refetch,
    };
  }

  return {
    activeRun: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useLatestActiveWorkoutRun = () => {
  const { isAuthenticated, isReady } = useAuth();
  const liveActiveRun = useLiveActiveWorkoutRun();

  const query = useQuery<WorkoutRunStart | null>({
    queryKey: workoutRunKeys.latestActive(),
    queryFn: async () => {
      const dto = await getLatestActiveWorkoutRunApi();
      if (!dto) return null;
      return mapWorkoutRunStartDto(dto);
    },
    enabled: isReady && isAuthenticated,
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnMount: true,
  });

  if (!isReady || !isAuthenticated) {
    return {
      activeRun: null,
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: query.refetch,
    };
  }

  const queriedActiveRun = query.data ?? null;
  const activeRun =
    liveActiveRun &&
    (!queriedActiveRun || liveActiveRun.runId === queriedActiveRun.runId)
      ? liveActiveRun
      : queriedActiveRun;

  return {
    activeRun,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
