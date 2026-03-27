import { buildProgressAchievements } from "@/helpers/utils/selectors/progress/progressSelector";
import { useProgress } from "./useProgress";

export const useProgressAchievements = (includeWeek = true) => {
  const { progress: all, isLoading: isLoadingAll, isError: isErrorAll } =
    useProgress("all");

  const { progress: week, isLoading: isLoadingWeek, isError: isErrorWeek } =
    useProgress("week", { enabled: includeWeek });

  const achievements = buildProgressAchievements(all, week, includeWeek);

  return {
    achievements,
    allProgress: all,
    isLoading: isLoadingAll || (includeWeek && isLoadingWeek),
    isError: isErrorAll || (includeWeek && isErrorWeek),
  };
};
