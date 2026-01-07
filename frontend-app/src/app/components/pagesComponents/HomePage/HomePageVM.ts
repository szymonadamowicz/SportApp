import {
  getCompletedWorkouts,
  getTodayMissedWorkouts,
  getTodayUpcomingWorkouts,
  getUpcomingWorkouts,
} from "./../../../helpers/utils/selectors/workoutSelector";
import { useNow } from "@/hooks/useNow";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useRouter } from "next/navigation";
import {
  Tips,
  WeeklyProgress,
  RecentHighlights,
} from "@/mocks/WorkoutsPageMocks";
import { useHeroVM } from "@/helpers/viewModels/HomePageHeroVM";

export const useHomePageVM = () => {
  const router = useRouter();
  const now = useNow();
  const { all: workouts } = useWorkouts();

  const todayItems = getTodayUpcomingWorkouts(workouts, now);

  const completed = getCompletedWorkouts(workouts);
  const upcoming = getUpcomingWorkouts(workouts, now);

  const missedToday = getTodayMissedWorkouts(workouts, now);

  const hero = useHeroVM(workouts);

  return {
    hero,
    now,
    stats: {
      completedCount: completed.length,
      upcomingCount: upcoming.length,
    },

    today: {
      hasItems: todayItems.length > 0,
      items: todayItems,
      missedItems: missedToday,
    },

    info: {
      tips: Tips,
      weeklyProgress: WeeklyProgress,
      highlights: RecentHighlights,
    },

    goTo: (path: string) => router.push(path),
  };
};
