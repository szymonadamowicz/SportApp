import { useMemo } from "react";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";

export const useWorkoutById = (workoutId?: string) => {
  const { allWorkouts, isLoading, isError } = useWorkouts();

  const workoutById = useMemo(() => {
    if (!workoutId) return undefined;
    return allWorkouts.find((w) => w.id === workoutId);
  }, [allWorkouts, workoutId]);

  return {
    workoutById,
    isLoading,
    isError,
  };
};
