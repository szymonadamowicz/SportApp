import { workoutRunMock } from "@/api/apiMock/workoutRun/workoutRun.mock";
import { workoutRunReal } from "@/api/apiReal/workoutRun.real";
import { API_MODE } from "@/api/env";
import {
  CompleteWorkoutRunDto,
  SaveWorkoutRunProgressDto,
  WorkoutRunStartDto,
  WorkoutRunSummaryDto,
} from "@/types/workout/workoutRun";

const impl = API_MODE === "mock" ? workoutRunMock : workoutRunReal;

export const getActiveWorkoutRunApi = (
  workoutId: string,
): Promise<WorkoutRunStartDto | null> => impl.getActiveRun(workoutId);

export const startWorkoutRunApi = (
  workoutId: string,
): Promise<WorkoutRunStartDto> => impl.startRun(workoutId);

export const saveWorkoutRunProgressApi = (
  runId: string,
  payload: SaveWorkoutRunProgressDto,
): Promise<WorkoutRunStartDto> => impl.saveProgress(runId, payload);

export const completeWorkoutRunApi = (
  runId: string,
  payload: CompleteWorkoutRunDto,
): Promise<WorkoutRunSummaryDto> => impl.completeRun(runId, payload);
