import { deepClone } from "@/mocks/runtime/clone";
import {
  CompleteWorkoutRunDto,
  WorkoutRunStartDto,
  WorkoutRunSummaryDto,
} from "@/types/workout/workoutRun";

type WorkoutRunRecord = Omit<WorkoutRunStartDto, "entries"> & {
  finishedAt?: string;
  durationSec?: number;
  notes?: string;
  entries: CompleteWorkoutRunDto["entries"];
};

type WorkoutRunEntryRecord = CompleteWorkoutRunDto["entries"][number] & {
  completedAt: string;
};

let runsState: WorkoutRunRecord[] = [];

const getNextStepIndex = (run: WorkoutRunRecord): number => {
  const completedIndexes = new Set(run.entries.map((entry) => entry.stepIndex));

  const next = run.steps.find((step) => !completedIndexes.has(step.stepIndex));
  if (!next) {
    return run.steps.length;
  }

  return next.stepIndex;
};

const toStartDto = (
  run: WorkoutRunRecord,
  isResumed: boolean,
): WorkoutRunStartDto => {
  return {
    runId: run.runId,
    workoutId: run.workoutId,
    workoutTitle: run.workoutTitle,
    startedAt: run.startedAt,
    isResumed,
    nextStepIndex: getNextStepIndex(run),
    durationSec: run.durationSec,
    notes: run.notes,
    entries: deepClone(run.entries).map(
      (entry): WorkoutRunEntryRecord => ({
        ...entry,
        completedAt: entry.completedAt ?? "",
      }),
    ),
    steps: deepClone(run.steps),
  };
};

const requireRun = (runId: string): WorkoutRunRecord => {
  const run = runsState.find((entry) => entry.runId === runId);
  if (!run) {
    throw new Error(`Workout run not found: ${runId}`);
  }
  return run;
};

export const workoutRunsRepository = {
  create(run: WorkoutRunStartDto): WorkoutRunStartDto {
    const record: WorkoutRunRecord = {
      ...run,
      isResumed: false,
      nextStepIndex: 0,
      entries: deepClone(run.entries),
    };

    runsState.unshift(record);
    return deepClone(toStartDto(record, false));
  },

  getActive(workoutId: string): WorkoutRunStartDto | null {
    const run = runsState.find(
      (entry) => entry.workoutId === workoutId && !entry.finishedAt,
    );

    if (!run) {
      return null;
    }

    return deepClone(toStartDto(run, true));
  },

  saveProgress(
    runId: string,
    payload: CompleteWorkoutRunDto,
  ): WorkoutRunStartDto {
    const run = requireRun(runId);

    run.durationSec = payload.durationSec;
    run.notes = payload.notes;
    run.entries = deepClone(payload.entries);

    return deepClone(toStartDto(run, true));
  },

  complete(
    runId: string,
    payload: CompleteWorkoutRunDto,
  ): WorkoutRunSummaryDto {
    const run = requireRun(runId);

    const finishedAt = new Date().toISOString();

    run.finishedAt = finishedAt;
    run.durationSec = payload.durationSec;
    run.notes = payload.notes;
    run.entries = deepClone(payload.entries);

    const totalSets = run.entries.length;
    const metTargetSets = run.entries.filter((entry) => entry.metTarget).length;
    const expectedRepsTotal = run.entries.reduce(
      (accumulator, entry) => accumulator + entry.expectedReps,
      0,
    );
    const actualRepsTotal = run.entries.reduce(
      (accumulator, entry) => accumulator + entry.actualReps,
      0,
    );

    const completionRate =
      totalSets === 0
        ? 0
        : Number(((metTargetSets / totalSets) * 100).toFixed(2));

    return {
      runId: run.runId,
      workoutId: run.workoutId,
      finishedAt,
      totalSets,
      metTargetSets,
      expectedRepsTotal,
      actualRepsTotal,
      completionRate,
    };
  },

  __reset(): void {
    runsState = [];
  },
};
