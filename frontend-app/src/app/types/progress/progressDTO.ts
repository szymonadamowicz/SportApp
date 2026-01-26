export type ProgressScope = "all" | "week";

export interface ProgressDto {
  streak: {
    current: number;
    longest: number;
    lastWorkoutDate: string | null;
  };
  stats: {
    totalWorkouts: number;
    totalReps: number;
    totalVolume: number;
    maxWeight: number;
  };
  prs: {
    exerciseName: string;
    maxWeight: number;
  }[];
}
