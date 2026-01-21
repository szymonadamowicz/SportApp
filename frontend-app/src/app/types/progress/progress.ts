export type ProgressAchievements = {
  id: string;
  title: string;
  value: string;
  valueDiff?: string;
  valueWeek?: string;
  context: "info" | "pr";
  subLabel?: string;
  subLabelWeek?: string;
};

export type ProgressWeeklyCompletion = {
  completed: number;
  planned: number;
};

export interface ProgressStreak {
  days: number;
}

export type Progress = {
  achievements: ProgressAchievements[];
  streak: ProgressStreak;
};

export type WeeklyStats = {
  completed: number;
  planned: number;
};
