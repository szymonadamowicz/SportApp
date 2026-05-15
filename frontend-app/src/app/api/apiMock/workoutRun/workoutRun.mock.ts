import { mockWorkoutRunService } from "@/mocks/services/mockWorkoutRun.service";
import {
  CompleteWorkoutRunDto,
  SaveWorkoutRunProgressDto,
  WorkoutRunStartDto,
  WorkoutRunSummaryDto,
} from "@/types/workout/workoutRun";

export const workoutRunMock = {
  getActiveRun(workoutId: string): Promise<WorkoutRunStartDto | null> {
    return mockWorkoutRunService.getActiveRun(workoutId);
  },

  startRun(workoutId: string): Promise<WorkoutRunStartDto> {
    return mockWorkoutRunService.startRun(workoutId);
  },

  saveProgress(
    runId: string,
    payload: SaveWorkoutRunProgressDto,
  ): Promise<WorkoutRunStartDto> {
    return mockWorkoutRunService.saveProgress(runId, payload);
  },

  completeRun(
    runId: string,
    payload: CompleteWorkoutRunDto,
  ): Promise<WorkoutRunSummaryDto> {
    return mockWorkoutRunService.completeRun(runId, payload);
  },
};
