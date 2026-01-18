"use client";

import { useQuery } from "@tanstack/react-query";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { mapWorkoutDTO } from "@/api/mappers/workout/workoutMapper";
import { fetchWorkoutsApi } from "@/api/workouts.api";
import { Workout } from "@/types/workout/workout";

export const useWorkouts = () => {
  const query = useQuery<Workout[]>({
    queryKey: workoutsKeys.all,
    queryFn: async () => {
      const dtos = await fetchWorkoutsApi();
      return dtos.map(mapWorkoutDTO);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  return {
    allWorkouts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
