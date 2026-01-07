import { WorkoutListItemVM } from "@/types/pages/workoutPage";
import { Workout } from "@/types/workout/workout";
import { getWorkoutDate, getWorkoutDay } from "../utils/calculate/workoutDay";
import { formatTimeDiff } from "../utils/calculate/workoutTime";
import { getWorkoutStatus } from "../utils/workout/workoutStatus";

export const mapWorkoutToListItemVM = (
  workout: Workout,
  now: Date
): WorkoutListItemVM => ({
  id: workout.id,
  title: workout.title,
  muscleGroups: workout.muscleGroups,
  mainFocus: workout.mainFocus,
  status: getWorkoutStatus(workout, now),
  timeLabel: formatTimeDiff(workout.scheduledAt, now),
  dayLabel: getWorkoutDay(workout.scheduledAt, now),
  dateLabel: getWorkoutDate(workout.scheduledAt),
});
