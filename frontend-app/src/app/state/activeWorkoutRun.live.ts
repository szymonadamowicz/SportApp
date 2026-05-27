"use client";

import { useSyncExternalStore } from "react";
import { WorkoutRunStart } from "@/types/workout/workoutRun";

let activeWorkoutRunSnapshot: WorkoutRunStart | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const setLiveActiveWorkoutRun = (run: WorkoutRunStart) => {
  activeWorkoutRunSnapshot = run;
  emit();
};

export const clearLiveActiveWorkoutRun = (runId?: string) => {
  if (runId && activeWorkoutRunSnapshot?.runId !== runId) return;

  activeWorkoutRunSnapshot = null;
  emit();
};

export const getLiveActiveWorkoutRun = () => activeWorkoutRunSnapshot;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useLiveActiveWorkoutRun = () =>
  useSyncExternalStore(
    subscribe,
    getLiveActiveWorkoutRun,
    getLiveActiveWorkoutRun,
  );
