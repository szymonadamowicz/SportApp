"use client";

import { useQuery } from "@tanstack/react-query";
import { mapWorkoutDTO } from "@/api/mappers/workoutMapper";
import { fetchWorkoutsMock } from "@/api/workoutsApi.mock";
import { Workout } from "@/types/workout";

export const useTrainingData = () => {
  return useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      const dtos = await fetchWorkoutsMock();
      return dtos.map(mapWorkoutDTO);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
};
