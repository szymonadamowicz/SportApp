"use client";

import { useQuery } from "@tanstack/react-query";
import { mapWorkoutDTO } from "@/api/mappers/workoutMapper";
import { fetchWorkoutsMock } from "@/api/workoutsApi.mock";
import { Workout } from "@/types/workout";

export const useWorkouts = () => {
  const query = useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      const dtos = await fetchWorkoutsMock();
      return dtos.map(mapWorkoutDTO);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });

  return {
    all: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
