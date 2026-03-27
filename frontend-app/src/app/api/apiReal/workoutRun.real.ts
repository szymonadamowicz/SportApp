import { httpClient } from "@/api/httpClient";
import {
  CompleteWorkoutRunDto,
  SaveWorkoutRunProgressDto,
  WorkoutRunStartDto,
  WorkoutRunSummaryDto,
} from "@/types/workout/workoutRun";

export const workoutRunReal = {
  getActiveRun(workoutId: string): Promise<WorkoutRunStartDto | null> {
    return httpClient<WorkoutRunStartDto | null>(
      `/workout-runs/active/${workoutId}`,
    );
  },

  getLatestActiveRun(): Promise<WorkoutRunStartDto | null> {
    return httpClient<WorkoutRunStartDto | null>("/workout-runs/active");
  },

  startRun(workoutId: string): Promise<WorkoutRunStartDto> {
    return httpClient<WorkoutRunStartDto>(`/workout-runs/start/${workoutId}`, {
      method: "POST",
    });
  },

  saveProgress(
    runId: string,
    payload: SaveWorkoutRunProgressDto,
  ): Promise<WorkoutRunStartDto> {
    return httpClient<WorkoutRunStartDto>(`/workout-runs/${runId}/progress`, {
      method: "POST",
      body: payload,
    });
  },

  completeRun(
    runId: string,
    payload: CompleteWorkoutRunDto,
  ): Promise<WorkoutRunSummaryDto> {
    return httpClient<WorkoutRunSummaryDto>(`/workout-runs/${runId}/complete`, {
      method: "POST",
      body: payload,
    });
  },

  cancelRun(runId: string): Promise<void> {
    return httpClient<void>(`/workout-runs/${runId}/cancel`, {
      method: "POST",
    });
  },
};
