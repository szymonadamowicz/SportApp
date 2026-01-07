export interface ExerciseDTO {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTimeSec?: number;
}

export interface WorkoutDTO {
  id: string;
  title: string;
  scheduledAt: string;
  completedAt?: string | null;
  exercises: ExerciseDTO[];
  muscleGroups?: string[];
  mainFocus?: string;
}
