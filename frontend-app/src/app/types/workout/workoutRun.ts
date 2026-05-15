export type WorkoutRunStepDto = {
  stepIndex: number;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  expectedReps: number;
  expectedWeight?: number;
  restSeconds: number;
  exerciseSeconds: number;
};

export type WorkoutRunEntryDto = {
  stepIndex: number;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  expectedReps: number;
  actualReps: number;
  metTarget: boolean;
  exerciseDurationSec: number;
  restDurationSec: number;
  completedAt: string;
};

export type WorkoutRunStartDto = {
  runId: string;
  workoutId: string;
  workoutTitle: string;
  startedAt: string;
  isResumed: boolean;
  nextStepIndex: number;
  durationSec?: number;
  notes?: string;
  entries: WorkoutRunEntryDto[];
  steps: WorkoutRunStepDto[];
};

export type WorkoutRunEntryInputDto = {
  stepIndex: number;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  expectedReps: number;
  actualReps: number;
  metTarget: boolean;
  exerciseDurationSec: number;
  restDurationSec: number;
  completedAt?: string;
};

export type CompleteWorkoutRunDto = {
  durationSec?: number;
  notes?: string;
  entries: WorkoutRunEntryInputDto[];
};

export type SaveWorkoutRunProgressDto = CompleteWorkoutRunDto;

export type WorkoutRunSummaryDto = {
  runId: string;
  workoutId: string;
  finishedAt: string;
  totalSets: number;
  metTargetSets: number;
  expectedRepsTotal: number;
  actualRepsTotal: number;
  completionRate: number;
};

export type WorkoutRunStep = WorkoutRunStepDto;

export type WorkoutRunStart = Omit<WorkoutRunStartDto, "startedAt"> & {
  startedAt: Date;
};

export type WorkoutRunSummary = Omit<WorkoutRunSummaryDto, "finishedAt"> & {
  finishedAt: Date;
};
