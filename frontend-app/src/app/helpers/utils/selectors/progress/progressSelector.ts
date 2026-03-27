import { Progress, ProgressAchievements, WeeklyStats } from "@/types/progress/progress";
import { Workout } from "@/types/workout/workout";
import { isThisWeek } from "../../calculate/workoutTime";

export const getSelectedAchievementsProgress = (
  progress: ProgressAchievements[],
): ProgressAchievements[] => {
  return progress.slice(0, 3);
};

export const getInfoAchievementProgressItems = (
  progressAchievements: ProgressAchievements[],
): ProgressAchievements[] => {
  return progressAchievements.filter((p) => p.context === "info");
};

export const getPRAchievementProgressItems = (
  progressAchievements: ProgressAchievements[],
): ProgressAchievements[] => {
  return progressAchievements.filter((p) => p.context === "pr");
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

const formatInt = (n: number): string =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const formatKg = (n: number): string => {
  const rounded = Math.round(n * 10) / 10;
  return `${rounded % 1 === 0 ? Math.round(rounded) : rounded} kg`;
};

const formatVolume = (n: number): string => {
  if (n >= 1_000_000) return `${Math.round(n / 10_000) / 100}M`;
  if (n >= 1_000) return `${Math.round(n / 10) / 100}k`;
  return formatInt(n);
};

export const buildProgressAchievements = (
  all?: Progress,
  week?: Progress,
  preferWeekPrs = false,
): ProgressAchievements[] => {
  if (!all) return [];

  const weekStats = week?.stats;

  const items: ProgressAchievements[] = [
    {
      id: "total-workouts",
      title: "Total workouts",
      value: formatInt(all.stats.totalWorkouts),
      valueWeek: weekStats ? formatInt(weekStats.totalWorkouts) : undefined,
      context: "info",
      subLabel: "all time",
      subLabelWeek: "this week",
    },
    {
      id: "total-reps",
      title: "Total reps",
      value: formatInt(all.stats.totalReps),
      valueWeek: weekStats ? formatInt(weekStats.totalReps) : undefined,
      context: "info",
      subLabel: "all time",
      subLabelWeek: "this week",
    },
    {
      id: "total-volume",
      title: "Total volume",
      value: formatVolume(all.stats.totalVolume),
      valueWeek: weekStats ? formatVolume(weekStats.totalVolume) : undefined,
      context: "info",
      subLabel: "kg lifted",
      subLabelWeek: "kg lifted",
    },
    {
      id: "max-weight",
      title: "Max weight",
      value: formatKg(all.stats.maxWeight),
      valueWeek: weekStats ? formatKg(weekStats.maxWeight) : undefined,
      context: "info",
      subLabel: "best set",
      subLabelWeek: "best set",
    },
    {
      id: "streak",
      title: "Streak",
      value: `${all.streak.current} day${all.streak.current === 1 ? "" : "s"}`,
      valueWeek: `${all.streak.current} day${all.streak.current === 1 ? "" : "s"}`,
      context: "info",
      subLabel: `Longest: ${all.streak.longest}`,
      subLabelWeek: `Longest: ${all.streak.longest}`,
    },
  ];

  const prs = (preferWeekPrs && week ? week.prs : all.prs).slice(0, 6);
  for (const pr of prs) {
    items.push({
      id: `pr-${pr.exerciseName}`,
      title: pr.exerciseName,
      value: "Best set",
      valueDiff: formatKg(pr.maxWeight),
      context: "pr",
    });
  }

  if (prs.length === 0) {
    items.push({
      id: "no-prs",
      title: "No PRs yet",
      value: "Complete a workout",
      context: "pr",
    });
  }

  return items;
};
