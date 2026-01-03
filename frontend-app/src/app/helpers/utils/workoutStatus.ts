import { Workout } from "@/types/workout";
import { WorkoutStatus } from "@/types/workoutPage";

export const getWorkoutStatus = (
  workout: Workout,
  now = new Date()
): WorkoutStatus => {
  if (workout.completedAt) return "completed";
  if (workout.scheduledAt < now) return "missed";
  return "upcoming";
};
