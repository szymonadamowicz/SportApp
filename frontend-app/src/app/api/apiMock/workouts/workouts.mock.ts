import { WorkoutDTO } from "@/types/workout/workoutDTO";
import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
} from "@/types/workout/workout";
import { workoutsMockDb } from "./workouts.mockDb";

export const workoutsMock = {
  fetchWorkouts(): Promise<WorkoutDTO[]> {
    return workoutsMockDb.fetchAll();
  },

  fetchLastCompletedWorkout(): Promise<WorkoutDTO | null> {
    return workoutsMockDb.getLastCompleted();
  },

  createWorkout(payload: CreateWorkoutPayload): Promise<WorkoutDTO> {
    return workoutsMockDb.create(payload.workout as WorkoutDTO);
  },

  updateWorkout(payload: UpdateWorkoutPayload): Promise<void> {
    return workoutsMockDb.patchByPayload(payload);
  },
};
