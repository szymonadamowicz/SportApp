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
  activePhase: dto.activePhase ?? "exercise",
  currentStepIndex: Number.isFinite(dto.currentStepIndex)
    ? dto.currentStepIndex
    : dto.nextStepIndex,
  remainingSeconds: Number.isFinite(dto.remainingSeconds)
    ? dto.remainingSeconds
    : undefined,
  phaseDurationSec: Number.isFinite(dto.phaseDurationSec)
    ? dto.phaseDurationSec
    : undefined,
  isPaused: Boolean(dto.isPaused),
  entries: Array.isArray(dto.entries) ? dto.entries : [],
  steps: Array.isArray(dto.steps) ? dto.steps : [],
  startedAt: new Date(dto.startedAt),
  lastProgressAt: dto.lastProgressAt
    ? new Date(dto.lastProgressAt)
    : undefined,
});

export const mapWorkoutRunSummaryDto = (
  dto: WorkoutRunSummaryDto,
): WorkoutRunSummary => ({
  ...dto,
  finishedAt: new Date(dto.finishedAt),
});
