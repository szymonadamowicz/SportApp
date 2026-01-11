import { WorkoutListItemVM, WorkoutStatus } from "@/types/pages/workoutPage";
import { Workout } from "@/types/workout/workout";
import { getWorkoutDate, getWorkoutDay } from "../utils/calculate/workoutDay";
import { formatTimeDiff } from "../utils/calculate/workoutTime";

export const mapWorkoutToListItemVM = (
  workout: Workout,
  now: Date
): WorkoutListItemVM => {
  let status: WorkoutStatus = "default";

  if (workout.completedAt) {
    status = "completed";
  } else if (workout.scheduledAt < now) {
    status = "missed";
  } else {
    status = "upcoming";
  }

  return {
    id: workout.id,
    title: workout.title,
    muscleGroups: workout.muscleGroups,
    mainFocus: workout.mainFocus,
    status,
    timeLabel: formatTimeDiff(workout.scheduledAt, now),
    dayLabel: getWorkoutDay(workout.scheduledAt, now),
    dateLabel: getWorkoutDate(workout.scheduledAt),
  };
};
