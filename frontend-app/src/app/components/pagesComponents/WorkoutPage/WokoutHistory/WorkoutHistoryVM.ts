"use client";

import { mapWorkoutToListItemVM } from "@/helpers/mappers/mapWorkoutToListItemVm";
import {
  getUpcomingWorkouts,
  getMissedWorkouts,
  getCompletedWorkouts,
} from "@/helpers/utils/selectors/workout/workoutSelector";
import { useNow } from "@/hooks/helperHooks/useNow";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";
import { useState } from "react";

export const useWorkoutsHistoryVM = () => {
  const { allWorkouts: workouts } = useWorkouts();
  const now = useNow();
  const [seeAllHistory, setSeeAllHistory] = useState(false);

  const upcoming = getUpcomingWorkouts(workouts, now);
  const missed = getMissedWorkouts(workouts, now);
  const completed = getCompletedWorkouts(workouts);

  const orderedWorkoutsRaw = seeAllHistory
    ? [...upcoming, ...missed, ...completed]
    : missed;

  const orderedWorkouts = Array.from(
    new Map(orderedWorkoutsRaw.map((w) => [w.id, w])).values()
  );

  const items = orderedWorkouts.map((w) => mapWorkoutToListItemVM(w, now));

  return {
    items,
    seeAllHistory,
    toggle: () => setSeeAllHistory((v) => !v),
  };
};
