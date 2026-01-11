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

  updateWorkout(payload: UpdateWorkoutPayload): Promise<void> {
    switch (payload.kind) {
      case "workout":
      case "exercise":
      case "createExercise":
        return httpClient<void>(`/workouts/${payload.workoutId}`, {
          method: "PATCH",
          body: payload,
        });

      default:
        return Promise.resolve();
    }
  },
};
