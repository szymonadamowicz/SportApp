import { Workout } from "@/types/workout/workout";
import { formatTimeDiff } from "../calculate/workoutTime";
import { getWorkoutDate, getWorkoutDay } from "../calculate/workoutDay";

export const getWorkoutTimeLabel = (workout: Workout, now = new Date()) => {
  return formatTimeDiff(workout.scheduledAt, now);
};

export const getWorkoutDayLabel = (workout: Workout, now = new Date()) => {
  return getWorkoutDay(workout.scheduledAt, now);
};

export const getWorkoutDateLabel = (workout: Workout) => {
  return getWorkoutDate(workout.scheduledAt);
};
