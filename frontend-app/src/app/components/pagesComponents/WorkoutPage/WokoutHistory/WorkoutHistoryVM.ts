"use client";

import { mapWorkoutToListItemVM } from "@/helpers/mappers/mapWorkoutToListItemVm";
import { getUpcomingWorkouts, getMissedWorkouts, getCompletedWorkouts } from "@/helpers/utils/selectors/workoutSelector";
import { useNow } from "@/hooks/useNow";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useState } from "react";

export const useWorkoutsHistoryVM = () => {
  const { all: workouts } = useWorkouts();
  const now = useNow();
  const [seeAllHistory, setSeeAllHistory] = useState(false);

  const upcoming = getUpcomingWorkouts(workouts, now);
  const missed = getMissedWorkouts(workouts, now);
  const completed = getCompletedWorkouts(workouts);

  const orderedWorkouts = seeAllHistory
    ? [...upcoming, ...missed, ...completed]
    : missed;

  const items = orderedWorkouts.map((w) => mapWorkoutToListItemVM(w, now));

  return {
    items,
    seeAllHistory,
    toggle: () => setSeeAllHistory((v) => !v),
  };
};
