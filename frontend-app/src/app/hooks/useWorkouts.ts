"use client";

import { useNow } from "./useNow";
import { useTrainingData } from "./useTrainingData";
import { isSameDay, isThisWeek } from "@/components/utils/workoutTime";

export const useWorkouts = () => {
  const { data: workouts = [], isLoading, error } = useTrainingData();
  const now = useNow(60_000);

  if (isLoading) {
    return {
      loading: true,
      all: [],
      completed: [],
      upcoming: [],
      today: [],
      thisWeek: [],
      nextWorkout: null,
    };
  }

  if (error) {
    throw error;
  }

  const completed = workouts.filter((w) => w.completedAt != null);

  const upcoming = workouts
    .filter(
      (w) => w.completedAt == null && w.scheduledAt.getTime() >= now.getTime()
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const today = upcoming.filter((w) => isSameDay(w.scheduledAt, now));

  const thisWeek = upcoming.filter((w) => isThisWeek(w.scheduledAt, now));

  const nextWorkout = upcoming[0] ?? null;

  return {
    loading: false,
    all: workouts,
    completed,
    upcoming,
    today,
    thisWeek,
    nextWorkout,
  };
};
