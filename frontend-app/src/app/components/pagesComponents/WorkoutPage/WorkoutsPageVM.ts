"use client";

import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useNow } from "@/hooks/useNow";
import { getWorkoutStatus } from "@/helpers/utils/workoutStatus";
import { formatTimeDiff } from "@/helpers/utils/workoutTime";
import { getWorkoutDay } from "@/helpers/utils/workoutDay";
import { WorkoutListItemVM, WorkoutListState } from "@/types/workoutPage";

export const useWorkoutsPageVM = () => {
  const { all: workouts } = useWorkouts();
  const now = useNow();

  const [seeAll, setSeeAll] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>();

  const upcoming = workouts.filter(
    (w) => !w.completedAt && w.scheduledAt > now
  );

  const upcomingWeek = upcoming.filter(
    (w) => getWorkoutStatus(w, now) === "upcoming"
  );

  const baseList = seeAll ? upcoming : upcomingWeek;

  const listState: WorkoutListState =
    upcoming.length === 0 ? "empty" : "hasData";

  const list: WorkoutListItemVM[] =
    listState === "hasData"
      ? baseList.map((w) => ({
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
  };
};
