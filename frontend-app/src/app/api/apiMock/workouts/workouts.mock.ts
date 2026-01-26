import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { CreateWorkoutPayload } from "@/types/workout/workout";
import { workoutsMockDb } from "./workouts.mockDb";
import { mapWorkoutToDTO } from "@/api/mappers/workout/workoutMapper";
import { FeedbackValue } from "@/types/pages/progressPage";

export const workoutsMock = {
  fetchWorkouts(): Promise<WorkoutDTO[]> {
    return workoutsMockDb.fetchAll();
  },

  fetchLastCompletedWorkout(): Promise<WorkoutDTO | null> {
    return workoutsMockDb.getLastCompleted();
  },

  createWorkout(payload: CreateWorkoutPayload): Promise<WorkoutDTO> {
    const data = mapWorkoutToDTO(payload.workout);
    return workoutsMockDb.create(data);
  },

  patchWorkoutMeta(
    id: string,
    dto: {
      scheduledAt?: string | null;
      completedAt?: string | null;
      perceivedLoad?: FeedbackValue;
    },
  ): Promise<WorkoutDTO> {
    return workoutsMockDb.patchMeta(id, dto);
  },

  putWorkoutStructure(
    id: string,
    dto: { title: string; exercises: WorkoutDTO["exercises"] },
  ): Promise<WorkoutDTO> {
    return workoutsMockDb.putStructure(id, dto);
  },
};
