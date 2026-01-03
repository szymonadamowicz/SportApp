"use client";

import { useNow } from "@/hooks/useNow";
import { useWorkouts } from "@/hooks/useWorkouts";
import { formatTimeDiff } from "@/helpers/utils/workoutTime";
import { getWorkoutDay } from "@/helpers/utils/workoutDay";
import { getWorkoutStatus } from "@/helpers/utils/workoutStatus";
import { useRouter } from "next/navigation";
import { WorkoutListItemVM } from "@/types/workoutPage";
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

  const todayItems: WorkoutListItemVM[] = workouts
    .filter((w) => {
      const d = new Date(w.scheduledAt);
      const n = new Date(now);
      return d.toDateString() === n.toDateString();
    })
    .map((w) => ({
      id: w.id,
      title: w.title,
      muscleGroup: w.muscleGroup,
      status: getWorkoutStatus(w, now),
      timeLabel: formatTimeDiff(w.scheduledAt, now),
      dayLabel: getWorkoutDay(w.scheduledAt),
      workout: w,
    }));

  const completed = workouts.filter((w) => w.completedAt);
  const upcoming = workouts.filter(
    (w) => !w.completedAt && w.scheduledAt > now
  );

  const hero = useHeroVM(workouts);

  return {
    hero,

    stats: {
      completedCount: completed.length,
      upcomingCount: upcoming.length,
    },

    today: {
      hasItems: todayItems.length > 0,
      items: todayItems,
    },

    info: {
      tips: Tips,
      weeklyProgress: WeeklyProgress,
      highlights: RecentHighlights,
    },

    goTo: (path: string) => router.push(path),
  };
};
