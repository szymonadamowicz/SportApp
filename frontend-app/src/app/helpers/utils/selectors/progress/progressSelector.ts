import { ProgressAchievements, WeeklyStats } from "@/types/progress/progress";
import { Workout } from "@/types/workout/workout";
import { isThisWeek } from "../../calculate/workoutTime";

export const getSelectedAchievementsProgress = (
  progress: ProgressAchievements[],
): ProgressAchievements[] => {
  const selected: ProgressAchievements[] = [];

  for (let i = 0; i < (progress.length < 3 ? progress.length : 3); i++) {
    selected.push(progress[i]);
  }

  return selected;
};

export const getInfoAchievementProgressItems = (
  progressAchievements: ProgressAchievements[],
): ProgressAchievements[] => {
  return progressAchievements.filter((p) => p.context == "info");
};

export const getPRAchievementProgressItems = (
  progressAchievements: ProgressAchievements[],
): ProgressAchievements[] => {
  return progressAchievements.filter((p) => p.context == "pr");
};

export const calculateWeeklyCompletion = (
  workouts: Workout[],
  now: Date = new Date(),
): number => {
  if (!workouts || workouts.length === 0) return 0;

  return workouts.filter((workout) => {
    if (!workout.completedAt) return false;
    return isThisWeek(new Date(workout.completedAt), now);
  }).length;
};

export const calculateWeeklyStats = (
  workouts: Workout[],
  now: Date = new Date(),
): WeeklyStats => {
  let completed = 0;
  let planned = 0;

  workouts.forEach((workout) => {
    if (!isThisWeek(workout.scheduledAt, now)) return;

    planned += 1;

    if (workout.completedAt) {
      completed += 1;
    }
  });

  return { completed, planned };
};
