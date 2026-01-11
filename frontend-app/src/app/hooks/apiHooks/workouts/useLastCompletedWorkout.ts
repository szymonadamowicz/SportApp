import { useMemo } from "react";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";
import { getLastCompletedWorkout } from "@/helpers/utils/selectors/workout/workoutSelector";

export const useLastCompletedWorkout = () => {
  const { allWorkouts, isLoading, isError } = useWorkouts();

  const lastCompletedWorkout = useMemo(
    () => getLastCompletedWorkout(allWorkouts),
    [allWorkouts]
  );

  return {
    lastCompletedWorkout,
    isLoading,
    isError,
  };
};
