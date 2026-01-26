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
import { Tips } from "@/api/apiMock/workouts/workouts.seed";
import { useWeeklyStats } from "@/hooks/apiHooks/progress/useProgressWeeklyStats";
import { useProgress } from "@/hooks/apiHooks/progress/useProgress";
import { Highlights } from "@/types/workout/workout";

const buildHighlights = (
  streakDays: number,
  topPr?: { exerciseName: string; maxWeight: number },
): Highlights[] => {
  const items: Highlights[] = [];

  if (topPr) {
    items.push({
      title: `${topPr.exerciseName} PR`,
      subtitle: `${Math.round(topPr.maxWeight * 10) / 10} kg`,
      rightPopup: "New",
    });
  }

  items.push({
    title: "Streak",
    subtitle: `${streakDays} day${streakDays === 1 ? "" : "s"} in a row`,
    rightPopup: streakDays > 0 ? "Level Up" : undefined,
  });

  return items;
};

export const useHomePageVM = () => {
  const router = useRouter();
  const now = useNow();
  const { allWorkouts: workouts } = useWorkouts();

  const { achievements: progressAchievements } = useProgressAchievements();
  const { progress: allProgress } = useProgress("all");
  const { completed, planned } = useWeeklyStats();

  const todayItems = getTodayUpcomingWorkouts(workouts, now);
  const missedToday = getTodayMissedWorkouts(workouts, now);
  const hero = useHeroVM(workouts);

  const selectedProgress =
    getSelectedAchievementsProgress(progressAchievements);

  const streakDays = allProgress?.streak.current ?? 0;
  const topPr = allProgress?.prs?.[0];
  const highlights = buildHighlights(streakDays, topPr);

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
      highlights,
    },

    goTo: (path: string) => router.push(path),
  };
};
