import { useProgress } from "./useProgress";

export const useProgressStreak = () => {
  const { progress, isLoading, isError } = useProgress("all");

  return {
    streak: progress?.streak,
    isLoading,
    isError,
  };
};
