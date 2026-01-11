import { useProgress } from "./useProgress";

export const useProgressAchievements = () => {
  const { progress, isLoading, isError } = useProgress();

  return {
    achievements: progress?.achievements ?? [],
    isLoading,
    isError,
  };
};
