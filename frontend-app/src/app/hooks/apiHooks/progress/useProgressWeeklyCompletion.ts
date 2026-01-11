import { useProgress } from "./useProgress";

export const useProgressWeeklyCompletion = () => {
  const { progress, isLoading, isError } = useProgress();

  return {
    weeklyCompletion: progress?.weeklyCompletion,
    isLoading,
    isError,
  };
};
