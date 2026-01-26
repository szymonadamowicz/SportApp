export type ProgressPr = {
  exerciseName: string;
  maxWeight: number;
};

export type ProgressStats = {
  totalWorkouts: number;
  totalReps: number;
  totalVolume: number;
  maxWeight: number;
};

export type ProgressStreak = {
  current: number;
  longest: number;
  lastWorkoutDate: string | null;
};

export type Progress = {
  streak: ProgressStreak;
  stats: ProgressStats;
  prs: ProgressPr[];
};

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

export type WeeklyStats = {
  completed: number;
  planned: number;
};
