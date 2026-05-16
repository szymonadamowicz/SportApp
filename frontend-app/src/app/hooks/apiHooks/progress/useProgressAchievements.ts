import { buildProgressAchievements } from "@/helpers/utils/selectors/progress/progressSelector";
import { useProgress } from "./useProgress";

export const useProgressAchievements = () => {
  const { progress: all, isLoading: isLoadingAll, isError: isErrorAll } =
    useProgress("all");

  const { progress: week, isLoading: isLoadingWeek, isError: isErrorWeek } =
    useProgress("week");

  const achievements = buildProgressAchievements(all, week);

  return {
    achievements,
    allProgress: all,
    isLoading: isLoadingAll || isLoadingWeek,
    isError: isErrorAll || isErrorWeek,
  };
};
