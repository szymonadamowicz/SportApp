import { httpClient } from "@/api/httpClient";
import { WorkoutDTO } from "@/types/workout/workoutDTO";
import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
} from "@/types/workout/workout";

export const workoutsReal = {
  fetchWorkouts(): Promise<WorkoutDTO[]> {
    return httpClient<WorkoutDTO[]>("/workouts");
  },

  fetchLastCompletedWorkout(): Promise<WorkoutDTO | null> {
    return httpClient<WorkoutDTO | null>("/workouts/lastCompleted");
  },

  createWorkout(payload: CreateWorkoutPayload): Promise<WorkoutDTO> {
    return httpClient<WorkoutDTO>("/workouts", {
      method: "POST",
      body: payload.workout,
    });
  },

  updateWorkout(payload: UpdateWorkoutPayload): Promise<WorkoutDTO> {
    return httpClient<WorkoutDTO>("/workouts", {
      method: "PATCH",
      body: payload.workout,
    });
  },
};
