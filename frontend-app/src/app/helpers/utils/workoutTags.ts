import { Workout } from "@/types/workout";
import { formatTimeDiff } from "./workoutTime";
import { getWorkoutDay } from "./workoutDay";

export const getWorkoutTimeLabel = (workout: Workout, now = new Date()) => {
  return formatTimeDiff(workout.scheduledAt, now);
};

export const getWorkoutDayLabel = (workout: Workout) => {
  return getWorkoutDay(workout.scheduledAt);
};

