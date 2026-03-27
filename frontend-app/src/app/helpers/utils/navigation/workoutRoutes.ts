"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const openEditWorkout = (
  router: AppRouterInstance,
  workoutId: string,
) => {
  router.push(`/workouts?modal=open&edit=${workoutId}`, {
    scroll: false,
  });
};

export const openWorkoutRun = (
  router: AppRouterInstance,
  workoutId: string,
) => {
  router.push(`/workout-run/${workoutId}`, {
    scroll: false,
  });
};
