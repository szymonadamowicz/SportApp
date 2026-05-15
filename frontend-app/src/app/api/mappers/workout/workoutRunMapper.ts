import {
  WorkoutRunStart,
  WorkoutRunStartDto,
  WorkoutRunSummary,
  WorkoutRunSummaryDto,
} from "@/types/workout/workoutRun";

export const mapWorkoutRunStartDto = (
  dto: WorkoutRunStartDto,
): WorkoutRunStart => ({
  ...dto,
  isResumed: Boolean(dto.isResumed),
  nextStepIndex: Number.isFinite(dto.nextStepIndex) ? dto.nextStepIndex : 0,
  entries: Array.isArray(dto.entries) ? dto.entries : [],
  steps: Array.isArray(dto.steps) ? dto.steps : [],
  startedAt: new Date(dto.startedAt),
});

export const mapWorkoutRunSummaryDto = (
  dto: WorkoutRunSummaryDto,
): WorkoutRunSummary => ({
  ...dto,
  finishedAt: new Date(dto.finishedAt),
});
