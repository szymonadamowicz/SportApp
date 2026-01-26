import { buildProgressAchievements } from "@/helpers/utils/selectors/progress/progressSelector";
import { useProgress } from "./useProgress";
import { useWeeklyStats } from "./useProgressWeeklyStats";

export const useProgressAchievements = () => {
  const { progress: all, isLoading: isLoadingAll, isError: isErrorAll } =
    useProgress("all");

  const { progress: week, isLoading: isLoadingWeek, isError: isErrorWeek } =
    useProgress("week");

  const weeklyStats = useWeeklyStats();

  const achievements = buildProgressAchievements(all, week, weeklyStats);

  return {
    achievements,
    isLoading: isLoadingAll || isLoadingWeek,
    isError: isErrorAll || isErrorWeek,
  };
};
