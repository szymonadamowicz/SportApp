"use client";

import { useCompleteWorkoutRun } from "@/hooks/apiHooks/workoutRun/useCompleteWorkoutRun";
import { workoutRunKeys } from "@/api/keys/workoutRun.keys";
import { useStartWorkoutRun } from "@/hooks/apiHooks/workoutRun/useStartWorkoutRun";
import { useSaveWorkoutRunProgress } from "@/hooks/apiHooks/workoutRun/useSaveWorkoutRunProgress";
import { useActiveWorkoutRun } from "@/hooks/apiHooks/workoutRun/useActiveWorkoutRun";
import {
  WorkoutRunPageVM,
  WorkoutRunPhase,
} from "@/types/pages/workoutRunPage";
import {
  CompleteWorkoutRunDto,
  SaveWorkoutRunProgressDto,
  WorkoutRunEntryInputDto,
  WorkoutRunStart,
  WorkoutRunStep,
  WorkoutRunSummary,
} from "@/types/workout/workoutRun";
import {
  clearLiveActiveWorkoutRun,
  setLiveActiveWorkoutRun,
} from "@/state/activeWorkoutRun.live";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const normalizeRepsInput = (value: string): string => {
  return value.replace(/[^\d]/g, "");
};

const toSecondsLeft = (remainingMs: number): number => {
  if (remainingMs >= 0) {
    return Math.ceil(remainingMs / 1000);
  }

  return -Math.ceil(Math.abs(remainingMs) / 1000);
};

const clampProgress = (value: number): number => {
  return Math.max(0, Math.min(1, value));
};

const upsertEntries = (
  entries: WorkoutRunEntryInputDto[],
  entry: WorkoutRunEntryInputDto,
): WorkoutRunEntryInputDto[] => {
  const index = entries.findIndex((item) => item.stepIndex === entry.stepIndex);
  const next = [...entries];

  if (index >= 0) {
    next[index] = entry;
  } else {
    next.push(entry);
  }

  return next.sort((a, b) => a.stepIndex - b.stepIndex);
};

const getRestoredRemainingSeconds = (
  run: WorkoutRunStart,
  phase: WorkoutRunPhase,
  fallbackSeconds: number,
): number => {
  const storedSeconds =
    run.remainingSeconds ?? (phase === "summary" ? 0 : fallbackSeconds);

  if (phase === "summary" || run.isPaused || !run.lastProgressAt) {
    return storedSeconds;
  }

  const elapsedSinceLastProgress = Math.floor(
    Math.max(0, Date.now() - run.lastProgressAt.getTime()) / 1000,
  );

  return storedSeconds - elapsedSinceLastProgress;
};

type ProgressStateOverride = Partial<
  Pick<
    SaveWorkoutRunProgressDto,
    | "activePhase"
    | "currentStepIndex"
    | "remainingSeconds"
    | "phaseDurationSec"
    | "isPaused"
  >
>;

export const useWorkoutRunPageVM = (workoutId: string): WorkoutRunPageVM => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const startMutation = useStartWorkoutRun();
  const completeMutation = useCompleteWorkoutRun();
  const progressMutation = useSaveWorkoutRunProgress();
  const { activeRun } = useActiveWorkoutRun(workoutId);

  const [session, setSession] = useState<WorkoutRunStart | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  const [status, setStatus] = useState<WorkoutRunPageVM["status"]>("idle");
  const [phase, setPhase] = useState<WorkoutRunPhase>("exercise");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const [pendingActualReps, setPendingActualReps] = useState("");
  const [pendingMetTarget, setPendingMetTarget] = useState(true);

  const [entries, setEntries] = useState<WorkoutRunEntryInputDto[]>([]);
  const [summary, setSummary] = useState<WorkoutRunSummary | null>(null);
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const phaseEndAtRef = useRef<number | null>(null);
  const remainingMsRef = useRef(0);
  const elapsedTickRef = useRef<number>(Date.now());
  // Use number for browser timer id (compatible with window.setInterval)
  const autoSaveTimerRef = useRef<number | null>(null);
  const autoSaveInFlightRef = useRef<Promise<void> | null>(null);
  const isCompletingRef = useRef(false);
  const phaseRef = useRef<WorkoutRunPhase>("exercise");
  const currentStepIndexRef = useRef(0);
  const phaseDurationRef = useRef(0);
  const isPausedRef = useRef(false);
  const entriesRef = useRef<WorkoutRunEntryInputDto[]>([]);
  const notesRef = useRef("");

  useEffect(() => {
    remainingMsRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    phaseDurationRef.current = phaseDuration;
  }, [phaseDuration]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const restoreSessionState = useCallback((run: WorkoutRunStart) => {
    const normalizedRun = {
      ...run,
      steps: [...(run.steps ?? [])].sort((a, b) => a.stepIndex - b.stepIndex),
    };
    const steps = normalizedRun.steps;
    const requestedStepIndex =
      Number.isFinite(normalizedRun.currentStepIndex)
        ? (normalizedRun.currentStepIndex ?? 0)
        : (normalizedRun.nextStepIndex ?? 0);
    const safeStepIndex =
      steps.length === 0
        ? 0
        : Math.max(0, Math.min(requestedStepIndex, steps.length - 1));
    const restoredPhase =
      normalizedRun.activePhase ??
      ((normalizedRun.nextStepIndex ?? 0) >= steps.length
        ? "summary"
        : "exercise");
    const currentRestoredStep = steps[safeStepIndex];
    const fallbackDuration =
      restoredPhase === "rest"
        ? Math.max(5, currentRestoredStep?.restSeconds ?? 0)
        : Math.max(1, currentRestoredStep?.exerciseSeconds ?? 0);
    const durationSec =
      normalizedRun.phaseDurationSec ?? (restoredPhase === "summary" ? 0 : fallbackDuration);
    const remainingSec =
      getRestoredRemainingSeconds(normalizedRun, restoredPhase, durationSec);
    const restoredRemainingMs = remainingSec * 1000;
    const restoredPaused = restoredPhase === "summary" ? true : Boolean(normalizedRun.isPaused);

    setSession(normalizedRun);
    setLiveActiveWorkoutRun(normalizedRun);
    entriesRef.current = normalizedRun.entries ?? [];
    setEntries(normalizedRun.entries ?? []);
    setCurrentStepIndex(safeStepIndex);
    setNotes(normalizedRun.notes ?? "");
    setElapsedMs((normalizedRun.durationSec ?? 0) * 1000);
    elapsedTickRef.current = Date.now();
    setStatus("running");
    setSummary(null);
    setPhase(restoredPhase);
    setPhaseDuration(durationSec);
    setRemainingMs(restoredRemainingMs);
    setSecondsLeft(toSecondsLeft(restoredRemainingMs));
    setIsPaused(restoredPaused);
    setPendingActualReps(String(currentRestoredStep?.expectedReps ?? ""));
    setPendingMetTarget(true);
    phaseEndAtRef.current =
      restoredPaused || restoredPhase === "summary"
        ? null
        : Date.now() + restoredRemainingMs;
  }, []);

  useEffect(() => {
    if (!activeRun || hasRestoredSession) return;

    restoreSessionState(activeRun);
    setHasRestoredSession(true);
  }, [activeRun, hasRestoredSession, restoreSessionState]);

  const currentStep = useMemo(() => {
    if (!session) return null;
    return session.steps[currentStepIndex] ?? null;
  }, [session, currentStepIndex]);

  const phaseProgress = useMemo(() => {
    if (phaseDuration <= 0) return 1;
    const durationMs = phaseDuration * 1000;
    const elapsedMs = durationMs - remainingMs;
    return clampProgress(elapsedMs / durationMs);
  }, [phaseDuration, remainingMs]);

  const upsertEntry = useCallback((entry: WorkoutRunEntryInputDto) => {
    setEntries((prev) => upsertEntries(prev, entry));
  }, []);

  const getElapsedExerciseSeconds = useCallback((step: WorkoutRunStep) => {
    const elapsedMs = Math.max(
      1000,
      step.exerciseSeconds * 1000 - remainingMsRef.current,
    );

    return Math.max(1, Math.min(21_600, Math.round(elapsedMs / 1000)));
  }, []);

  const enterExercisePhase = useCallback((step: WorkoutRunStep) => {
    const exerciseSeconds = Math.max(1, step.exerciseSeconds);
    const durationMs = exerciseSeconds * 1000;

    setPhase("exercise");
    setPhaseDuration(exerciseSeconds);
    setRemainingMs(durationMs);
    setSecondsLeft(toSecondsLeft(durationMs));
    setIsPaused(false);
    setPendingActualReps(String(step.expectedReps));
    setPendingMetTarget(true);
    phaseEndAtRef.current = Date.now() + durationMs;
  }, []);

  const enterRestPhase = useCallback((restSeconds: number) => {
    const safeRestSeconds = Math.max(5, restSeconds);
    const durationMs = safeRestSeconds * 1000;

    setPhase("rest");
    setPhaseDuration(safeRestSeconds);
    setRemainingMs(durationMs);
    setSecondsLeft(toSecondsLeft(durationMs));
    setIsPaused(false);
    phaseEndAtRef.current = Date.now() + durationMs;
  }, []);

  const moveToNextStep = useCallback(() => {
    if (!session) return;

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex >= session.steps.length) {
      setPhase("summary");
      setSecondsLeft(0);
      setRemainingMs(0);
      setPhaseDuration(0);
      setIsPaused(true);
      phaseEndAtRef.current = null;
      return;
    }

    setCurrentStepIndex(nextStepIndex);
    enterExercisePhase(session.steps[nextStepIndex]);
  }, [session, currentStepIndex, enterExercisePhase]);

  const buildProgressPayload = useCallback(
    (
      entriesOverride: WorkoutRunEntryInputDto[] = entriesRef.current,
      stateOverride: ProgressStateOverride = {},
    ): SaveWorkoutRunProgressDto => {
      const durationSec = session
        ? Math.max(
            1,
            Math.round((Date.now() - session.startedAt.getTime()) / 1000),
          )
        : 0;

      return {
        durationSec,
        notes: notesRef.current.trim() || undefined,
        entries: entriesOverride,
        activePhase: stateOverride.activePhase ?? phaseRef.current,
        currentStepIndex:
          stateOverride.currentStepIndex ?? currentStepIndexRef.current,
        remainingSeconds:
          stateOverride.remainingSeconds ?? toSecondsLeft(remainingMsRef.current),
        phaseDurationSec:
          stateOverride.phaseDurationSec ?? phaseDurationRef.current,
        isPaused: stateOverride.isPaused ?? isPausedRef.current,
      };
    },
    [session],
  );

  const syncActiveRunCache = useCallback(
    (payload: SaveWorkoutRunProgressDto) => {
      if (!session) return;

      const optimisticRun: WorkoutRunStart = {
        ...session,
        activePhase: payload.activePhase,
        currentStepIndex: payload.currentStepIndex,
        remainingSeconds: payload.remainingSeconds,
        phaseDurationSec: payload.phaseDurationSec,
        isPaused: Boolean(payload.isPaused),
        durationSec: payload.durationSec,
        notes: payload.notes,
        entries: payload.entries.map((entry) => ({
          ...entry,
          completedAt: entry.completedAt ?? new Date().toISOString(),
        })),
        lastProgressAt: new Date(),
      };

      queryClient.setQueryData(
        workoutRunKeys.active(session.workoutId),
        optimisticRun,
      );
      queryClient.setQueryData(workoutRunKeys.latestActive(), optimisticRun);
      setLiveActiveWorkoutRun(optimisticRun);
    },
    [queryClient, session],
  );

  const persistProgress = useCallback(
    async (
      entriesOverride: WorkoutRunEntryInputDto[] = entriesRef.current,
      stateOverride?: ProgressStateOverride,
    ) => {
      if (
        !session ||
        session.runId.length === 0 ||
        isCompletingRef.current
      ) {
        return;
      }

      const payload = buildProgressPayload(entriesOverride, stateOverride);
      syncActiveRunCache(payload);

      const savePromise = progressMutation
        .mutateAsync({
          runId: session.runId,
          payload,
        })
        .then(
          () => undefined,
          () => undefined,
        );

      autoSaveInFlightRef.current = savePromise;

      try {
        await savePromise;
      } finally {
        if (autoSaveInFlightRef.current === savePromise) {
          autoSaveInFlightRef.current = null;
        }
      }
    },
    [buildProgressPayload, progressMutation, session, syncActiveRunCache],
  );

  const syncRuntimeProgressCache = useCallback(
    (stateOverride: ProgressStateOverride = {}) => {
      if (!session || status !== "running" || isCompletingRef.current) {
        return;
      }

      syncActiveRunCache(
        buildProgressPayload(entriesRef.current, stateOverride),
      );
    },
    [buildProgressPayload, session, status, syncActiveRunCache],
  );

  useEffect(() => {
    if (!session) return;
    if (phase === "summary") return;
    if (isPaused) return;

    const tick = () => {
      const phaseEndAt = phaseEndAtRef.current;
      if (!phaseEndAt) return;

      const msLeft = phaseEndAt - Date.now();
      setRemainingMs(msLeft);
      setSecondsLeft((prev) => {
        const next = toSecondsLeft(msLeft);
        return next === prev ? prev : next;
      });
    };

    tick();

    const timerId = window.setInterval(tick, 250);

    return () => {
      window.clearInterval(timerId);
    };
  }, [session, phase, isPaused]);

  useEffect(() => {
    if (!session || status !== "running" || isCompletingRef.current) {
      return;
    }

    syncRuntimeProgressCache();

    const cacheTimerId = window.setInterval(() => {
      syncRuntimeProgressCache();
    }, 1000);

    return () => {
      window.clearInterval(cacheTimerId);
    };
  }, [session, status, syncRuntimeProgressCache]);

  const startSession = useCallback(async () => {
    if (status === "starting" || status === "running" || status === "saving") {
      return;
    }

    try {
      setStatus("starting");
      setErrorMessage(undefined);

      const started = await startMutation.mutateAsync(workoutId);
      const normalizedStarted = {
        ...started,
        steps: [...(started.steps ?? [])].sort(
          (a, b) => a.stepIndex - b.stepIndex,
        ),
      };

      if (normalizedStarted.isResumed) {
        restoreSessionState(normalizedStarted);
        setHasRestoredSession(true);
        return;
      }

      setSession(normalizedStarted);
      setLiveActiveWorkoutRun(normalizedStarted);
      setElapsedMs((normalizedStarted.durationSec ?? 0) * 1000);
      elapsedTickRef.current = Date.now();

      entriesRef.current = [];
      setEntries([]);
      setCurrentStepIndex(0);
      setNotes("");

      setSummary(null);
      setIsPaused(false);

      if ((normalizedStarted.steps ?? []).length === 0) {
        setPhase("summary");
        setPhaseDuration(0);
        setSecondsLeft(0);
        setRemainingMs(0);
        setIsPaused(true);
        phaseEndAtRef.current = null;
      } else {
        const firstStep =
          normalizedStarted.steps[normalizedStarted.nextStepIndex ?? 0] ??
          normalizedStarted.steps[0];
        if (firstStep) {
          enterExercisePhase(firstStep);
        }
      }

      setStatus("running");
    } catch {
      setStatus("error");
      setErrorMessage("Unable to start workout session.");
    }
  }, [
    status,
    startMutation,
    workoutId,
    enterExercisePhase,
    restoreSessionState,
  ]);

  const saveSetAndContinue = useCallback(() => {
    if (!currentStep || !session) return;

    const actualReps = Math.max(0, Number(pendingActualReps || "0"));
    const elapsedSeconds = getElapsedExerciseSeconds(currentStep);

    const entry: WorkoutRunEntryInputDto = {
      stepIndex: currentStep.stepIndex,
      exerciseId: currentStep.exerciseId,
      exerciseName: currentStep.exerciseName,
      setNumber: currentStep.setNumber,
      expectedReps: currentStep.expectedReps,
      actualReps,
      metTarget: pendingMetTarget,
      exerciseDurationSec: elapsedSeconds,
      restDurationSec: currentStep.restSeconds,
      completedAt: new Date().toISOString(),
    };

    const nextEntries = upsertEntries(entriesRef.current, entry);
    entriesRef.current = nextEntries;
    upsertEntry(entry);

    const isLastStep = currentStepIndex >= session.steps.length - 1;
    if (isLastStep) {
      persistProgress(nextEntries, {
        activePhase: "summary",
        currentStepIndex,
        remainingSeconds: 0,
        phaseDurationSec: 0,
        isPaused: true,
      }).catch(() => {});
      setPhase("summary");
      setPhaseDuration(0);
      setSecondsLeft(0);
      setRemainingMs(0);
      setIsPaused(true);
      phaseEndAtRef.current = null;
      return;
    }

    persistProgress(nextEntries, {
      activePhase: "rest",
      currentStepIndex,
      remainingSeconds: Math.max(5, currentStep.restSeconds),
      phaseDurationSec: Math.max(5, currentStep.restSeconds),
      isPaused: false,
    }).catch(() => {});
    enterRestPhase(currentStep.restSeconds);
  }, [
    currentStep,
    session,
    pendingActualReps,
    pendingMetTarget,
    currentStepIndex,
    enterRestPhase,
    getElapsedExerciseSeconds,
    persistProgress,
    upsertEntry,
  ]);

  const skipExercise = useCallback(() => {
    if (!session || !currentStep) return;
    if (status !== "running") return;
    if (phase !== "exercise") return;

    const entry: WorkoutRunEntryInputDto = {
      stepIndex: currentStep.stepIndex,
      exerciseId: currentStep.exerciseId,
      exerciseName: currentStep.exerciseName,
      setNumber: currentStep.setNumber,
      expectedReps: currentStep.expectedReps,
      actualReps: 0,
      metTarget: false,
      exerciseDurationSec: getElapsedExerciseSeconds(currentStep),
      restDurationSec: currentStep.restSeconds,
      completedAt: new Date().toISOString(),
    };

    const nextEntries = upsertEntries(entriesRef.current, entry);
    entriesRef.current = nextEntries;
    upsertEntry(entry);

    const isLastStep = currentStepIndex >= session.steps.length - 1;
    if (isLastStep) {
      persistProgress(nextEntries, {
        activePhase: "summary",
        currentStepIndex,
        remainingSeconds: 0,
        phaseDurationSec: 0,
        isPaused: true,
      }).catch(() => {});
      setPhase("summary");
      setPhaseDuration(0);
      setSecondsLeft(0);
      setRemainingMs(0);
      setIsPaused(true);
      phaseEndAtRef.current = null;
      return;
    }

    persistProgress(nextEntries, {
      activePhase: "rest",
      currentStepIndex,
      remainingSeconds: Math.max(5, currentStep.restSeconds),
      phaseDurationSec: Math.max(5, currentStep.restSeconds),
      isPaused: false,
    }).catch(() => {});
    enterRestPhase(currentStep.restSeconds);
  }, [
    session,
    currentStep,
    status,
    phase,
    getElapsedExerciseSeconds,
    upsertEntry,
    currentStepIndex,
    enterRestPhase,
    persistProgress,
  ]);

  const skipRest = useCallback(() => {
    if (phase !== "rest") return;
    const nextStepIndex = currentStepIndex + 1;
    const nextStep = session?.steps[nextStepIndex];
    if (nextStep) {
      persistProgress(entriesRef.current, {
        activePhase: "exercise",
        currentStepIndex: nextStepIndex,
        remainingSeconds: Math.max(1, nextStep.exerciseSeconds),
        phaseDurationSec: Math.max(1, nextStep.exerciseSeconds),
        isPaused: false,
      }).catch(() => {});
    }
    moveToNextStep();
  }, [
    phase,
    currentStepIndex,
    session,
    moveToNextStep,
    persistProgress,
  ]);

  const goToPreviousStep = useCallback(() => {
    if (!session || session.steps.length === 0) return;

    const previousStepIndex = Math.max(0, currentStepIndex - 1);
    const previousStep = session.steps[previousStepIndex];
    if (!previousStep) return;

    setCurrentStepIndex(previousStepIndex);
    setStatus("running");
    setSummary(null);
    persistProgress(entriesRef.current, {
      activePhase: "exercise",
      currentStepIndex: previousStepIndex,
      remainingSeconds: Math.max(1, previousStep.exerciseSeconds),
      phaseDurationSec: Math.max(1, previousStep.exerciseSeconds),
      isPaused: false,
    }).catch(() => {});
    enterExercisePhase(previousStep);
  }, [session, currentStepIndex, enterExercisePhase, persistProgress]);

  const buildCompletionPayload = useCallback(
    (entriesOverride?: WorkoutRunEntryInputDto[]): CompleteWorkoutRunDto => {
      const payloadEntries = entriesOverride ?? entries;

      if (!session) {
        return {
          durationSec: 0,
          notes,
          entries: payloadEntries,
        };
      }

      const startedAtTime =
        session.startedAt instanceof Date
          ? session.startedAt.getTime()
          : new Date(session.startedAt).getTime();

      const durationSec = Math.max(
        1,
        Math.round((Date.now() - startedAtTime) / 1000),
      );

      return {
        durationSec,
        notes: notes.trim() || undefined,
        entries: payloadEntries,
      };
    },
    [session, notes, entries],
  );

  const finishSession = useCallback(async () => {
    if (!session) return;
    if (status === "saving") return;

    try {
      isCompletingRef.current = true;
      setStatus("saving");
      setErrorMessage(undefined);
      setIsPaused(true);
      phaseEndAtRef.current = null;

      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      if (autoSaveInFlightRef.current) {
        await autoSaveInFlightRef.current;
      }

      const completionEntries = [...entries];
      if (phase === "exercise" && currentStep) {
        const actualReps = Math.max(0, Number(pendingActualReps || "0"));
        const currentEntry: WorkoutRunEntryInputDto = {
          stepIndex: currentStep.stepIndex,
          exerciseId: currentStep.exerciseId,
          exerciseName: currentStep.exerciseName,
          setNumber: currentStep.setNumber,
          expectedReps: currentStep.expectedReps,
          actualReps,
          metTarget: pendingMetTarget,
          exerciseDurationSec: getElapsedExerciseSeconds(currentStep),
          restDurationSec: currentStep.restSeconds,
          completedAt: new Date().toISOString(),
        };

        const entryIndex = completionEntries.findIndex(
          (entry) => entry.stepIndex === currentEntry.stepIndex,
        );

        if (entryIndex >= 0) {
          completionEntries[entryIndex] = currentEntry;
        } else {
          completionEntries.push(currentEntry);
        }

        completionEntries.sort((a, b) => a.stepIndex - b.stepIndex);
      }

      const completed = await completeMutation.mutateAsync({
        runId: session.runId,
        payload: buildCompletionPayload(completionEntries),
      });

      clearLiveActiveWorkoutRun(session.runId);
      setSummary(completed);
      setStatus("completed");
    } catch (error) {
      isCompletingRef.current = false;
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message.length > 180
            ? "Unable to save workout session. Please try again."
            : error.message
          : "Unable to save workout session.",
      );
    }
  }, [
    session,
    status,
    completeMutation,
    buildCompletionPayload,
    entries,
    phase,
    currentStep,
    pendingActualReps,
    pendingMetTarget,
    getElapsedExerciseSeconds,
  ]);

  const pauseTimer = useCallback(() => {
    if (phase === "summary") return;
    phaseEndAtRef.current = null;
    persistProgress(entriesRef.current, {
      isPaused: true,
      remainingSeconds: toSecondsLeft(remainingMsRef.current),
    }).catch(() => {});
    setIsPaused(true);
  }, [phase, persistProgress]);

  const resumeTimer = useCallback(() => {
    if (phase === "summary") return;

    const ms = remainingMsRef.current;
    phaseEndAtRef.current = Date.now() + ms;
    elapsedTickRef.current = Date.now();
    persistProgress(entriesRef.current, {
      isPaused: false,
      remainingSeconds: toSecondsLeft(ms),
    }).catch(() => {});
    setIsPaused(false);
  }, [phase, persistProgress]);

  const togglePause = useCallback(() => {
    if (phase === "summary") return;

    if (isPaused) {
      resumeTimer();
      return;
    }

    pauseTimer();
  }, [phase, isPaused, pauseTimer, resumeTimer]);

  const autosaveProgress = useCallback(async () => {
    if (!session || status !== "running" || isCompletingRef.current) {
      return;
    }

    await persistProgress(entriesRef.current);
  }, [session, status, persistProgress]);

  useEffect(() => {
    if (!session || status !== "running" || isPaused || phase === "summary") {
      return;
    }

    elapsedTickRef.current = Date.now();

    const elapsedTimerId = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, now - elapsedTickRef.current);
      elapsedTickRef.current = now;
      setElapsedMs((current) => current + delta);
    }, 1000);

    return () => {
      window.clearInterval(elapsedTimerId);
    };
  }, [session, status, isPaused, phase]);

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      window.clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    if (!session || status !== "running" || isCompletingRef.current) {
      return;
    }

    autoSaveTimerRef.current = window.setInterval(() => {
      autosaveProgress();
    }, 10_000);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [autosaveProgress, session, status]);

  useEffect(() => {
    if (!session || status !== "running") return;

    const saveBeforeBackground = () => {
      autosaveProgress().catch(() => {});
    };

    const saveWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        saveBeforeBackground();
      }
    };

    window.addEventListener("pagehide", saveBeforeBackground);
    document.addEventListener("visibilitychange", saveWhenHidden);

    return () => {
      window.removeEventListener("pagehide", saveBeforeBackground);
      document.removeEventListener("visibilitychange", saveWhenHidden);
    };
  }, [autosaveProgress, session, status]);

  const backToWorkouts = useCallback(() => {
    syncRuntimeProgressCache();
    autosaveProgress().catch(() => {});
    router.push("/workouts");
  }, [router, autosaveProgress, syncRuntimeProgressCache]);

  return {
    workoutId,
    session,
    currentStep,
    currentStepIndex,
    entries,

    status,
    phase,
    secondsLeft,
    phaseDuration,
    phaseProgress,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    isPaused,

    pendingActualReps,
    setPendingActualReps: (value) =>
      setPendingActualReps(normalizeRepsInput(value)),
    pendingMetTarget,
    setPendingMetTarget,

    notes,
    setNotes,
    summary,
    errorMessage,

    startSession,
    togglePause,
    saveSetAndContinue,
    skipRest,
    skipExercise,
    goToPreviousStep,
    finishSession,
    backToWorkouts,
  };
};
