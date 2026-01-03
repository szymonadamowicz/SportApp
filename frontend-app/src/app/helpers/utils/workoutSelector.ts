import { WorkoutDTO } from "@/types/workoutDTO";
import { isSameDay } from "./workoutTime";

export const isCompleted = (w: WorkoutDTO) => Boolean(w.completedAt);

export const isMissedWorkout = (
  workout: WorkoutDTO,
  now: Date = new Date()
): boolean => {
  if (workout.completedAt) return false;

  return new Date(workout.scheduledAt).getTime() < now.getTime();
};

export const isUpcoming = (w: WorkoutDTO, now = new Date()) =>
  !w.completedAt && new Date(w.scheduledAt) > now;

export const getCompletedWorkouts = (workouts: WorkoutDTO[]) =>
  workouts.filter(isCompleted);

export const getUpcomingWorkouts = (workouts: WorkoutDTO[], now = new Date()) =>
  workouts
    .filter((w) => isUpcoming(w, now))
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

export const getWorkoutsForDay = (workouts: WorkoutDTO[], day = new Date()) =>
  workouts.filter((w) => isSameDay(new Date(w.scheduledAt), day));

export const getWorkoutsForWeek = (
  workouts: WorkoutDTO[],
  referenceDate = new Date()
) => {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - start.getDay() + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return workouts.filter((w) => {
    const d = new Date(w.scheduledAt);
    return d >= start && d < end;
  });
};
