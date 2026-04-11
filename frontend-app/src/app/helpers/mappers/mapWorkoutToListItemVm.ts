import { WorkoutListItemVM, WorkoutStatus } from "@/types/pages/workoutPage";
import { Workout } from "@/types/workout/workout";
import { getWorkoutDate, getWorkoutDay } from "../utils/calculate/workoutDay";
import {
  formatScheduledTime,
  formatTimeDiff,
} from "../utils/calculate/workoutTime";
import { isWorkoutCompleted } from "../utils/selectors/workout/workoutSelector";

export const mapWorkoutToListItemVM = (
  workout: Workout,
  now: Date,
): WorkoutListItemVM => {
  let status: WorkoutStatus = "default";
  const completionReference = workout.completedAt ?? workout.scheduledAt;

  if (isWorkoutCompleted(workout, now)) {
    status = "completed";
  } else if (workout.scheduledAt.getTime() < now.getTime()) {
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
    timeLabel:
      status === "missed"
        ? formatScheduledTime(workout.scheduledAt)
        : status === "completed"
          ? formatScheduledTime(completionReference)
          : formatTimeDiff(workout.scheduledAt, now),
    dayLabel: getWorkoutDay(
      status === "completed" ? completionReference : workout.scheduledAt,
      now,
    ),
    dateLabel: getWorkoutDate(
      status === "completed" ? completionReference : workout.scheduledAt,
    ),
  };
};
