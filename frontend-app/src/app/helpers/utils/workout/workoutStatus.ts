import { Workout } from "@/types/workout/workout";
import { WorkoutStatus } from "@/types/pages/workoutPage";

export const getWorkoutStatus = (
  workout: Workout,
  now = new Date()
): WorkoutStatus => {
  if (workout.completedAt) return "completed";
  if (!now) return "upcoming";
  if (workout.scheduledAt < now) return "missed";
  return "upcoming";
};
