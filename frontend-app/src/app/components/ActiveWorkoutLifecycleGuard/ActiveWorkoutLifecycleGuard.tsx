"use client";

import { useCancelWorkoutRun } from "@/hooks/apiHooks/workoutRun/useCancelWorkoutRun";
import { useLatestActiveWorkoutRun } from "@/hooks/apiHooks/workoutRun/useActiveWorkoutRun";
import { useSaveWorkoutRunProgress } from "@/hooks/apiHooks/workoutRun/useSaveWorkoutRunProgress";
import {
  SaveWorkoutRunProgressDto,
  WorkoutRunStart,
} from "@/types/workout/workoutRun";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const LAST_ACTIVITY_KEY = "sportapp-active-workout-last-activity-at";
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

const readStoredActivityAt = (): number => {
  if (typeof window === "undefined") return Date.now();

  const stored = window.localStorage.getItem(LAST_ACTIVITY_KEY);
  const parsed = stored ? Number(stored) : NaN;

  return Number.isFinite(parsed) ? parsed : Date.now();
};

const writeActivityAt = (value: number) => {
  window.localStorage.setItem(LAST_ACTIVITY_KEY, String(value));
};

const getRemainingSeconds = (activeRun: WorkoutRunStart, now: number): number => {
  const storedSeconds =
    activeRun.remainingSeconds ?? activeRun.phaseDurationSec ?? 0;

  if (
    activeRun.activePhase === "summary" ||
    activeRun.isPaused ||
    !activeRun.lastProgressAt
  ) {
    return storedSeconds;
  }

  const elapsedSeconds = Math.floor(
    Math.max(0, now - activeRun.lastProgressAt.getTime()) / 1000,
  );

  return storedSeconds - elapsedSeconds;
};

const buildHeartbeatPayload = (
  activeRun: WorkoutRunStart,
  now: number,
): SaveWorkoutRunProgressDto => ({
  durationSec: Math.max(
    activeRun.durationSec ?? 0,
    Math.floor(Math.max(0, now - activeRun.startedAt.getTime()) / 1000),
  ),
  notes: activeRun.notes || undefined,
  entries: activeRun.entries.map((entry) => ({
    stepIndex: entry.stepIndex,
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    setNumber: entry.setNumber,
    expectedReps: entry.expectedReps,
    actualReps: entry.actualReps,
    metTarget: entry.metTarget,
    exerciseDurationSec: entry.exerciseDurationSec,
    restDurationSec: entry.restDurationSec,
    completedAt: entry.completedAt,
  })),
  activePhase: activeRun.activePhase,
  currentStepIndex: activeRun.currentStepIndex,
  remainingSeconds: getRemainingSeconds(activeRun, now),
  phaseDurationSec: activeRun.phaseDurationSec,
  isPaused: activeRun.isPaused,
});

export function ActiveWorkoutLifecycleGuard() {
  const pathname = usePathname();
  const { activeRun } = useLatestActiveWorkoutRun();
  const cancelMutation = useCancelWorkoutRun();
  const saveMutation = useSaveWorkoutRunProgress();
  const activeRunRef = useRef<WorkoutRunStart | null>(null);
  const lastActivityAtRef = useRef(readStoredActivityAt());
  const lastHeartbeatAtRef = useRef(0);
  const isSavingHeartbeatRef = useRef(false);
  const isCancellingRef = useRef(false);

  useEffect(() => {
    activeRunRef.current = activeRun;
    if (!activeRun) {
      isCancellingRef.current = false;
    }
  }, [activeRun]);

  const sendHeartbeat = useCallback(
    async (now: number) => {
      const run = activeRunRef.current;
      const isRunPage =
        Boolean(run?.workoutId) && pathname === `/workout-run/${run?.workoutId}`;

      if (!run || isRunPage || isSavingHeartbeatRef.current) return;
      if (now - lastHeartbeatAtRef.current < HEARTBEAT_INTERVAL_MS) return;

      lastHeartbeatAtRef.current = now;
      isSavingHeartbeatRef.current = true;

      try {
        await saveMutation.mutateAsync({
          runId: run.runId,
          payload: buildHeartbeatPayload(run, now),
        });
      } catch {
        // The next poll or explicit workout action will reconcile the run state.
      } finally {
        isSavingHeartbeatRef.current = false;
      }
    },
    [pathname, saveMutation],
  );

  useEffect(() => {
    const markActivity = () => {
      const now = Date.now();
      lastActivityAtRef.current = now;
      writeActivityAt(now);
      sendHeartbeat(now).catch(() => {});
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "focus",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", markActivity);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      document.removeEventListener("visibilitychange", markActivity);
    };
  }, [sendHeartbeat]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const run = activeRunRef.current;
      if (!run || isCancellingRef.current) return;

      const inactiveForMs = Date.now() - lastActivityAtRef.current;
      if (inactiveForMs < INACTIVITY_TIMEOUT_MS) return;

      isCancellingRef.current = true;
      cancelMutation.mutate({
        runId: run.runId,
        workoutId: run.workoutId,
      });
    }, CHECK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [cancelMutation]);

  return null;
}
