import { WorkoutDTO } from "@/types/workout/workoutDTO";
import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
} from "@/types/workout/workout";
import { workoutsMockDb } from "./workouts.mockDb";
import { mapWorkoutToDTO } from "@/api/mappers/workout/workoutMapper";

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

  updateWorkout(payload: UpdateWorkoutPayload): Promise<WorkoutDTO> {
    const data = mapWorkoutToDTO(payload.workout);
    return workoutsMockDb.update(data);
  },
};
