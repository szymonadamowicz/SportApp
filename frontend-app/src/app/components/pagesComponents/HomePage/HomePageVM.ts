import {
  getTodayMissedWorkouts,
  getTodayUpcomingWorkouts,
} from "../../../helpers/utils/selectors/workout/workoutSelector";
import { useNow } from "@/hooks/helperHooks/useNow";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";
import { useRouter } from "next/navigation";
import { useHeroVM } from "@/helpers/viewModels/HomePageHeroVM";
import { useProgressAchievements } from "@/hooks/apiHooks/progress/useProgressAchievements";
import { getSelectedAchievementsProgress } from "@/helpers/utils/selectors/progress/progressSelector";
import { Tips, RecentHighlights } from "@/api/apiMock/workouts/workouts.seed";
import { useWeeklyStats } from "@/hooks/apiHooks/progress/useProgressWeeklyStats";

export const useHomePageVM = () => {
  const router = useRouter();
  const now = useNow();
  const { allWorkouts: workouts } = useWorkouts();

  const { achievements: progressAchievements } = useProgressAchievements();
  const { completed, planned } = useWeeklyStats();

  const todayItems = getTodayUpcomingWorkouts(workouts, now);
  const missedToday = getTodayMissedWorkouts(workouts, now);
  const hero = useHeroVM(workouts);

  const selectedProgress =
    getSelectedAchievementsProgress(progressAchievements);

  return {
    hero,
    now,

    statsWeekly: {
      completedCount: completed,
      plannedCount: planned,
    },

    today: {
      hasItems: todayItems.length > 0,
      items: todayItems,
      missedItems: missedToday,
    },

    info: {
      tips: Tips,
      progress: selectedProgress,
      highlights: RecentHighlights,
    },

    goTo: (path: string) => router.push(path),
  };
};
