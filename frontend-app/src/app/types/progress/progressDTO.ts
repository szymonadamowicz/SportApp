export interface ProgressAchievementsDTO {
  id: string;
  title: string;
  value: string;
  valueWeek?: string;
  valueDiff?: string;
  context: "info" | "pr";
  subLabel?: string;
  subLabelWeek?: string;
}

export interface ProgressWeeklyCompletionDTO {
  planned: number;
  completed: number;
}

export interface ProgressStreakDTO {
  days: number;
}

export type ProgressDTO = {
  achievements: ProgressAchievementsDTO[];
  weeklyCompletion: ProgressWeeklyCompletionDTO;
  streak: ProgressStreakDTO;
};
