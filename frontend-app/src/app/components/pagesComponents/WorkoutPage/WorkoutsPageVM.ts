"use client";

import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useNow } from "@/hooks/useNow";
import { getWorkoutStatus } from "@/helpers/utils/workoutStatus";
import { formatTimeDiff, isThisWeek } from "@/helpers/utils/workoutTime";
import { getWorkoutDay } from "@/helpers/utils/workoutDay";
import { WorkoutListItemVM, WorkoutListState } from "@/types/workoutPage";

export const useWorkoutsPageVM = () => {
  const { all: workouts } = useWorkouts();
  const now = useNow();

  const [seeAll, setSeeAll] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>();

  const notCompleted = workouts.filter((w) => !w.completedAt);
  const completed = workouts.filter((w) => w.completedAt);

  const missed = notCompleted.filter(
    (w) => getWorkoutStatus(w, now) === "missed"
  );
  const upcoming = notCompleted.filter(
    (w) => getWorkoutStatus(w, now) === "upcoming"
  );

  const upcomingThisWeek = upcoming.filter((w) =>
    isThisWeek(w.scheduledAt, now)
  );

  const visibleWorkouts = seeAll ? upcoming : upcomingThisWeek;

  const listState: WorkoutListState =
    visibleWorkouts.length === 0 ? "empty" : "hasData";

  const list: WorkoutListItemVM[] =
    listState === "hasData"
      ? visibleWorkouts.map((w) => ({
          id: w.id,
          title: w.title,
          muscleGroup: w.muscleGroup,
          status: getWorkoutStatus(w, now),
          timeLabel: formatTimeDiff(w.scheduledAt, now),
          dayLabel: getWorkoutDay(w.scheduledAt),
          workout: w,
        }))
      : [];

  const selected = workouts.find((w) => w.id === selectedWorkoutId);

  return {
    list,
    listState,
    selected,
    seeAll,
    toggleSeeAll: () => setSeeAll((v) => !v),
    selectWorkout: setSelectedWorkoutId,
    meta: {
      total: workouts.length,
      upcoming: upcoming.length,
      upcomingThisWeek: upcomingThisWeek.length,
      completed: completed.length,
      missed: missed.length,
    },
  };
};
