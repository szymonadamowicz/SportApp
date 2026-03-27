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
import { useWeeklyStats } from "@/hooks/apiHooks/progress/useProgressWeeklyStats";
import { useLatestActiveWorkoutRun } from "@/hooks/apiHooks/workoutRun/useActiveWorkoutRun";
import { Highlights } from "@/types/workout/workout";
import { HomePageVM } from "@/types/pages/homePage";
import { tipsFixture } from "@/mocks/fixtures/workouts.fixture";
import { WorkoutRunStart } from "@/types/workout/workoutRun";

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

const getActiveElapsedSeconds = (
  activeRun: WorkoutRunStart | null,
  now: Date,
): number => {
  if (!activeRun) return 0;

  return Math.max(
    activeRun.durationSec ?? 0,
    Math.floor(
      Math.max(0, now.getTime() - activeRun.startedAt.getTime()) / 1000,
    ),
  );
};

export const useHomePageVM = (): HomePageVM => {
  const router = useRouter();
  const now = useNow(1_000);
  const { allWorkouts: workouts, isLoading: isLoadingWorkouts } =
    useWorkouts();

  const {
    achievements: progressAchievements,
    allProgress,
    isLoading: isLoadingProgress,
  } = useProgressAchievements();
  const { completed, planned } = useWeeklyStats();
  const { activeRun } = useLatestActiveWorkoutRun();

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
    activeRun,
    activeElapsedSeconds: getActiveElapsedSeconds(activeRun, now),
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
      tips: tipsFixture,
      progress: selectedProgress,
      highlights,
    },

    goTo: (path: string) => router.push(path),
    isLoading: isLoadingWorkouts || isLoadingProgress,
  };
};
