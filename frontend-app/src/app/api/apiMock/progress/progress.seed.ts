import {
  ProgressAchievementsDTO,
  ProgressStreakDTO,
  ProgressWeeklyCompletionDTO,
} from "@/types/progress/progressDTO";

export const progressAchievementsSeed: ProgressAchievementsDTO[] = [
  {
    id: "1",
    title: "Tonnage",
    value: "26,000kg",
    valueWeek: "1,400kg",
    context: "info",
    subLabel: "above average",
    subLabelWeek: "Great value",
  },
  {
    id: "2",
    title: "Avg RPE",
    value: "RPE 7.5",
    valueWeek: "RPE 8.0",
    context: "info",
    subLabel: "balanced",
    subLabelWeek: "Great",
  },
  {
    id: "7",
    title: "Sessions completed",
    value: "30",
    valueWeek: "4",
    context: "info",
    subLabel: "Way to go",
    subLabelWeek: "Way to go",
  },
  {
    id: "3",
    title: "PRs Achieved this week",
    value: "21",
    valueWeek: "2",
    context: "info",
    subLabel: "You are doing great!",
    subLabelWeek: "keep going",
  },
  {
    id: "4",
    title: "Deadlift",
    value: "200",
    valueDiff: "+10kg",
    context: "pr",
  },
  {
    id: "5",
    title: "Chest Press",
    value: "140",
    valueDiff: "+5kg",
    context: "pr",
  },
  {
    id: "6",
    title: "Squat",
    value: "170",
    valueDiff: "+2.5kg",
    context: "pr",
  },
];

export const progressStreakSeed: ProgressStreakDTO = {
  days: 3,
};

export const progressWeeklyCompletionSeed: ProgressWeeklyCompletionDTO = {
  completed: 3,
  planned: 6,
};
