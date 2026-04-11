import { Workout } from "@/types/workout/workout";

export const isWorkoutCompleted = (
  workout: Workout,
  _now: Date = new Date(),
) => {
  void _now;
  return Boolean(workout.completedAt);
};

export const sortAsc = (workouts: Workout[]) =>
  [...workouts].sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
  );

export const sortDesc = (workouts: Workout[]) =>
  [...workouts].sort(
    (a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime(),
  );

export const getUpcomingWorkouts = (workouts: Workout[], now: Date) =>
  sortAsc(
    workouts.filter((w) => !isWorkoutCompleted(w, now) && w.scheduledAt > now),
  );

export const getMissedWorkouts = (workouts: Workout[], now: Date) =>
  sortDesc(
    workouts.filter((w) => !isWorkoutCompleted(w, now) && w.scheduledAt <= now),
  );

export const getCompletedWorkouts = (workouts: Workout[], now: Date) =>
  sortDesc(workouts.filter((w) => isWorkoutCompleted(w, now)));

export const getWorkoutsForWeek = (
  workouts: Workout[],
  referenceDate: Date = new Date(),
) => {
  const start = new Date(referenceDate);
  const isoDay = (start.getDay() + 6) % 7;

  start.setDate(start.getDate() - isoDay);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setMilliseconds(-1);

  return workouts.filter((w) => {
    const d = w.scheduledAt;
    return d >= start && d <= end;
  });
};

export const getTodayUpcomingWorkouts = (workouts: Workout[], now: Date) => {
  const start = new Date(now);
  return workouts.filter((w) => {
    const d = w.scheduledAt;
    return (
      d.getFullYear() === start.getFullYear() &&
      d.getMonth() === start.getMonth() &&
      d.getDate() === start.getDate() &&
      !w.completedAt &&
      d >= now
    );
  });
};

export const getTodayMissedWorkouts = (workouts: Workout[], now: Date) => {
  const start = new Date(now);
  return workouts.filter((w) => {
    const d = w.scheduledAt;
    return (
      d.getFullYear() === start.getFullYear() &&
      d.getMonth() === start.getMonth() &&
      d.getDate() === start.getDate() &&
      !w.completedAt &&
      d < now
    );
  });
};

export const getLastCompletedWorkout = (workouts: Workout[]) => {
  return [...workouts]
    .filter((w) => w.completedAt)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0];
};

export const getWorkoutById = (
  workouts: Workout[],
  workoutId: string,
): Workout | undefined => {
  return workouts.find((w) => w.id == workoutId);
};
