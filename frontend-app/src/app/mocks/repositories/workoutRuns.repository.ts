import { deepClone } from "@/mocks/runtime/clone";
import {
  CompleteWorkoutRunDto,
  SaveWorkoutRunProgressDto,
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

const mergeEntries = (
  currentEntries: WorkoutRunRecord["entries"],
  incomingEntries: WorkoutRunRecord["entries"],
): WorkoutRunRecord["entries"] => {
  const byStepIndex = new Map(
    currentEntries.map((entry) => [entry.stepIndex, entry]),
  );

  for (const entry of incomingEntries) {
    byStepIndex.set(entry.stepIndex, entry);
  }

  return [...byStepIndex.values()].sort((a, b) => a.stepIndex - b.stepIndex);
};

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
    activePhase: run.activePhase ?? "exercise",
    currentStepIndex: run.currentStepIndex ?? getNextStepIndex(run),
    remainingSeconds: run.remainingSeconds,
    phaseDurationSec: run.phaseDurationSec,
    isPaused: Boolean(run.isPaused),
    lastProgressAt: run.lastProgressAt,
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
      activePhase: "exercise",
      currentStepIndex: 0,
      remainingSeconds: undefined,
      phaseDurationSec: undefined,
      isPaused: false,
      lastProgressAt: undefined,
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

  getLatestActive(): WorkoutRunStartDto | null {
    const run = runsState
      .filter((entry) => !entry.finishedAt)
      .sort(
        (a, b) =>
          new Date(b.lastProgressAt ?? b.startedAt).getTime() -
          new Date(a.lastProgressAt ?? a.startedAt).getTime(),
      )[0];

    if (!run) {
      return null;
    }

    return deepClone(toStartDto(run, true));
  },

  saveProgress(
    runId: string,
    payload: SaveWorkoutRunProgressDto,
  ): WorkoutRunStartDto {
    const run = requireRun(runId);
    const now = new Date().toISOString();

    run.durationSec = payload.durationSec;
    run.notes = payload.notes;
    run.entries = mergeEntries(run.entries, deepClone(payload.entries));
    run.activePhase = payload.activePhase ?? run.activePhase ?? "exercise";
    run.currentStepIndex = payload.currentStepIndex ?? getNextStepIndex(run);
    run.remainingSeconds = payload.remainingSeconds;
    run.phaseDurationSec = payload.phaseDurationSec;
    run.isPaused = payload.isPaused ?? run.isPaused ?? false;
    run.lastProgressAt = now;

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
    run.activePhase = "summary";
    run.remainingSeconds = 0;
    run.phaseDurationSec = 0;
    run.isPaused = true;
    run.lastProgressAt = finishedAt;
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

  cancel(runId: string): void {
    const run = requireRun(runId);
    const finishedAt = new Date().toISOString();

    run.finishedAt = finishedAt;
    run.durationSec = Math.max(
      run.durationSec ?? 0,
      Math.floor(
        Math.max(0, Date.now() - new Date(run.startedAt).getTime()) / 1000,
      ),
    );
    run.activePhase = "summary";
    run.remainingSeconds = 0;
    run.phaseDurationSec = 0;
    run.isPaused = true;
    run.lastProgressAt = finishedAt;
  },

  __reset(): void {
    runsState = [];
  },
};
