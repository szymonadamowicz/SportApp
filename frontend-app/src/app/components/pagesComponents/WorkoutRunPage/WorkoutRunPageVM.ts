"use client";

import { useCompleteWorkoutRun } from "@/hooks/apiHooks/workoutRun/useCompleteWorkoutRun";
import { useStartWorkoutRun } from "@/hooks/apiHooks/workoutRun/useStartWorkoutRun";
import { useSaveWorkoutRunProgress } from "@/hooks/apiHooks/workoutRun/useSaveWorkoutRunProgress";
import { useActiveWorkoutRun } from "@/hooks/apiHooks/workoutRun/useActiveWorkoutRun";
import {
  WorkoutRunPageVM,
  WorkoutRunPhase,
} from "@/types/pages/workoutRunPage";
import {
  CompleteWorkoutRunDto,
  WorkoutRunEntryInputDto,
  WorkoutRunStart,
  WorkoutRunStep,
  WorkoutRunSummary,
} from "@/types/workout/workoutRun";
import { useRouter } from "next/navigation";
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

export const useWorkoutRunPageVM = (workoutId: string): WorkoutRunPageVM => {
  const router = useRouter();

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

  useEffect(() => {
    remainingMsRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    if (!activeRun || hasRestoredSession) return;

    const normalizedActive = {
      ...activeRun,
      steps: [...(activeRun.steps ?? [])].sort(
        (a, b) => a.stepIndex - b.stepIndex,
      ),
    };
    setSession(normalizedActive);
    setEntries(normalizedActive.entries ?? []);
    setCurrentStepIndex(normalizedActive.nextStepIndex ?? 0);
    setNotes(normalizedActive.notes ?? "");
    setElapsedMs((normalizedActive.durationSec ?? 0) * 1000);
    elapsedTickRef.current = Date.now();
    setStatus("running");
    setPhase("exercise");
    setHasRestoredSession(true);

    if (
      normalizedActive.steps.length > 0 &&
      (normalizedActive.nextStepIndex ?? 0) < normalizedActive.steps.length
    ) {
      const nextStep =
        normalizedActive.steps[normalizedActive.nextStepIndex ?? 0];
      if (nextStep) {
        const exerciseSeconds = Math.max(1, nextStep.exerciseSeconds);
        const durationMs = exerciseSeconds * 1000;
        setPhaseDuration(exerciseSeconds);
        setRemainingMs(durationMs);
        setSecondsLeft(toSecondsLeft(durationMs));
        setPendingActualReps(String(nextStep.expectedReps));
        setPendingMetTarget(true);
        phaseEndAtRef.current = Date.now() + durationMs;
      }
    }
  }, [activeRun, hasRestoredSession]);

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
    setEntries((prev) => {
      const index = prev.findIndex(
        (item) => item.stepIndex === entry.stepIndex,
      );
      const next = [...prev];

      if (index >= 0) {
        next[index] = entry;
      } else {
        next.push(entry);
      }

      next.sort((a, b) => a.stepIndex - b.stepIndex);
      return next;
    });
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
      setSession(normalizedStarted);
      setElapsedMs((normalizedStarted.durationSec ?? 0) * 1000);
      elapsedTickRef.current = Date.now();

      if (
        normalizedStarted.isResumed &&
        normalizedStarted.entries &&
        normalizedStarted.entries.length > 0
      ) {
        setEntries(normalizedStarted.entries);
        setCurrentStepIndex(normalizedStarted.nextStepIndex ?? 0);
        setNotes(normalizedStarted.notes ?? "");
      } else {
        setEntries([]);
        setCurrentStepIndex(0);
        setNotes("");
      }

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
  }, [status, startMutation, workoutId, enterExercisePhase]);

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

    upsertEntry(entry);

    const isLastStep = currentStepIndex >= session.steps.length - 1;
    if (isLastStep) {
      setPhase("summary");
      setPhaseDuration(0);
      setSecondsLeft(0);
      setRemainingMs(0);
      setIsPaused(true);
      phaseEndAtRef.current = null;
      return;
    }

    enterRestPhase(currentStep.restSeconds);
  }, [
    currentStep,
    session,
    pendingActualReps,
    pendingMetTarget,
    currentStepIndex,
    enterRestPhase,
    getElapsedExerciseSeconds,
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

    upsertEntry(entry);

    const isLastStep = currentStepIndex >= session.steps.length - 1;
    if (isLastStep) {
      setPhase("summary");
      setPhaseDuration(0);
      setSecondsLeft(0);
      setRemainingMs(0);
      setIsPaused(true);
      phaseEndAtRef.current = null;
      return;
    }

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
  ]);

  const skipRest = useCallback(() => {
    if (phase !== "rest") return;
    moveToNextStep();
  }, [phase, moveToNextStep]);

  const goToPreviousStep = useCallback(() => {
    if (!session || session.steps.length === 0) return;

    const previousStepIndex = Math.max(0, currentStepIndex - 1);
    const previousStep = session.steps[previousStepIndex];
    if (!previousStep) return;

    setCurrentStepIndex(previousStepIndex);
    setStatus("running");
    setSummary(null);
    enterExercisePhase(previousStep);
  }, [session, currentStepIndex, enterExercisePhase]);

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
    setIsPaused(true);
  }, [phase]);

  const resumeTimer = useCallback(() => {
    if (phase === "summary") return;

    const ms = remainingMsRef.current;
    phaseEndAtRef.current = Date.now() + ms;
    elapsedTickRef.current = Date.now();
    setIsPaused(false);
  }, [phase]);

  const togglePause = useCallback(() => {
    if (phase === "summary") return;

    if (isPaused) {
      resumeTimer();
      return;
    }

    pauseTimer();
  }, [phase, isPaused, pauseTimer, resumeTimer]);

  const autosaveProgress = useCallback(async () => {
    if (
      !session ||
      session.runId.length === 0 ||
      status !== "running" ||
      entries.length === 0 ||
      isCompletingRef.current
    ) {
      return;
    }

    const savePromise = progressMutation
      .mutateAsync({
        runId: session.runId,
        payload: {
          durationSec: Math.max(
            1,
            Math.round((Date.now() - session.startedAt.getTime()) / 1000),
          ),
          notes: notes.trim() || undefined,
          entries,
        },
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
  }, [session, status, entries, notes, progressMutation]);

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
    }, 30_000);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [autosaveProgress, session, status]);

  const backToWorkouts = useCallback(() => {
    autosaveProgress().catch(() => {});
    router.push("/workouts");
  }, [router, autosaveProgress]);

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
