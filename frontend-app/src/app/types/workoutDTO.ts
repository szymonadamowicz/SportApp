export interface ExerciseDTO {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  muscleGroups?: string[];
  restTimeSec?: number;
}

export interface WorkoutDTO {
  id: string;
  title: string;
  scheduledAt: string;
  completedAt?: string | null;
  exercises: ExerciseDTO[];
  muscleGroup: string;
  notes?: string;
}
