import { WorkoutDTO } from "@/types/workout/workoutDTO";

export type UpdateWorkoutMetaDto = {
  scheduledAt?: string | null;
  completedAt?: string | null;
  perceivedLoad?: string | null;
};

export type UpdateWorkoutStructureDto = {
  title: string;
  muscleGroups?: string[];
  exercises: WorkoutDTO["exercises"];
};
