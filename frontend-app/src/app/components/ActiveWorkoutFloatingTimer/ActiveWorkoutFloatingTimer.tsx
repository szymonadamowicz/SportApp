"use client";

import { useLatestActiveWorkoutRun } from "@/hooks/apiHooks/workoutRun/useActiveWorkoutRun";
import { WorkoutRunPhaseDto } from "@/types/workout/workoutRun";
import { Dumbbell, Grip, Timer, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";

type FloatingPosition = {
  x: number;
  y: number;
};

const POSITION_KEY = "sportapp-active-workout-timer-position";
const WIDTH = 304;
const HEIGHT = 118;
const EDGE_GAP = 16;

const getFloatingWidth = () => {
  if (typeof window === "undefined") return WIDTH;
  return Math.min(WIDTH, window.innerWidth - EDGE_GAP * 2);
};

const getBottomReservedSpace = () => {
  if (typeof window === "undefined") return EDGE_GAP;
  return window.innerWidth < 768 ? 96 : EDGE_GAP;
};

const formatTimer = (seconds: number): string => {
  const sign = seconds < 0 ? "+" : "";
  const absolute = Math.abs(seconds);
  const minutes = Math.floor(absolute / 60);
  const remainingSeconds = absolute % 60;

  return `${sign}${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

const getPhaseCopy = (phase?: WorkoutRunPhaseDto): string => {
  if (phase === "rest") return "Rest";
  if (phase === "summary") return "Summary";
  return "Exercise";
};

const clampPosition = (position: FloatingPosition): FloatingPosition => {
  if (typeof window === "undefined") return position;

  return {
    x: Math.min(
      Math.max(EDGE_GAP, position.x),
      Math.max(EDGE_GAP, window.innerWidth - getFloatingWidth() - EDGE_GAP),
    ),
    y: Math.min(
      Math.max(EDGE_GAP, position.y),
      Math.max(EDGE_GAP, window.innerHeight - HEIGHT - getBottomReservedSpace()),
    ),
  };
};

const getInitialPosition = (): FloatingPosition => {
  if (typeof window === "undefined") return { x: EDGE_GAP, y: EDGE_GAP };

  const saved = window.localStorage.getItem(POSITION_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as FloatingPosition;
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        return clampPosition(parsed);
      }
    } catch {
      window.localStorage.removeItem(POSITION_KEY);
    }
  }

  return clampPosition({
    x: window.innerWidth - getFloatingWidth() - 24,
    y: window.innerHeight - HEIGHT - getBottomReservedSpace(),
  });
};

export function ActiveWorkoutFloatingTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeRun } = useLatestActiveWorkoutRun();
  const [now, setNow] = useState(Date.now());
  const [dismissedRunId, setDismissedRunId] = useState<string | null>(null);
  const [position, setPosition] = useState<FloatingPosition>({
    x: EDGE_GAP,
    y: EDGE_GAP,
  });
  const positionRef = useRef(position);
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const initialPosition = getInitialPosition();
    positionRef.current = initialPosition;
    setPosition(initialPosition);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const nextPosition = clampPosition(positionRef.current);
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    setDismissedRunId(null);
  }, [activeRun?.runId]);

  const isCurrentRunPage =
    Boolean(activeRun?.workoutId) &&
    pathname === `/workout-run/${activeRun?.workoutId}`;
  const isDashboardPage = pathname === "/dashboard";

  useEffect(() => {
    if (isCurrentRunPage) {
      setDismissedRunId(null);
    }
  }, [isCurrentRunPage]);

  const secondsLeft = useMemo(() => {
    if (!activeRun) return 0;

    const storedSeconds =
      activeRun.remainingSeconds ?? activeRun.phaseDurationSec ?? 0;

    if (
      activeRun.activePhase === "summary" ||
      activeRun.isPaused ||
      !activeRun.lastProgressAt
    ) {
      return storedSeconds;
    }

    const elapsed = Math.floor(
      Math.max(0, now - activeRun.lastProgressAt.getTime()) / 1000,
    );

    return storedSeconds - elapsed;
  }, [activeRun, now]);

  if (
    !activeRun ||
    dismissedRunId === activeRun.runId ||
    isCurrentRunPage ||
    isDashboardPage
  ) {
    return null;
  }

  const currentStep = activeRun.steps[activeRun.currentStepIndex ?? 0];
  const phaseCopy = getPhaseCopy(activeRun.activePhase);

  const persistPosition = (nextPosition: FloatingPosition) => {
    window.localStorage.setItem(POSITION_KEY, JSON.stringify(nextPosition));
  };

  const openWorkout = () => {
    if (dragRef.current?.moved) return;
    router.push(`/workout-run/${activeRun.workoutId}`);
  };

  const dismiss = () => {
    setDismissedRunId(activeRun.runId);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      drag.moved = true;
    }

    const nextPosition = clampPosition({
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    });
    positionRef.current = nextPosition;

    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      setPosition(positionRef.current);
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const nextPosition = clampPosition(positionRef.current);
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    persistPosition(nextPosition);
    setPosition(nextPosition);
    window.setTimeout(() => {
      dragRef.current = null;
    }, 0);
  };

  return (
    <div
      className="fixed left-0 top-0 z-[70] w-[min(calc(100vw-2rem),19rem)] cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-950/92 text-white shadow-[0_22px_80px_rgba(0,0,0,0.38)] backdrop-blur-md will-change-transform active:cursor-grabbing"
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      onClick={openWorkout}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openWorkout();
        }
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-300" />
      <div className="flex items-start gap-3 p-4">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/10 text-cyan-100">
          {activeRun.activePhase === "rest" ? (
            <Timer size={20} />
          ) : (
            <Dumbbell size={20} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100/80">
            <Grip size={13} />
            {phaseCopy}
          </div>
          <div className="mt-1 font-mono text-3xl font-black leading-none text-white">
            {formatTimer(secondsLeft)}
          </div>
          <div className="mt-2 truncate text-sm font-semibold text-slate-100">
            {currentStep?.exerciseName ?? activeRun.workoutTitle}
          </div>
          <div className="mt-1 text-xs text-slate-300">
            {currentStep
              ? `Set ${currentStep.setNumber}/${currentStep.totalSets} - ${currentStep.expectedReps} reps`
              : activeRun.workoutTitle}
          </div>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition hover:border-rose-300/60 hover:bg-rose-400/15 hover:text-white"
          aria-label="Hide active workout timer"
          onClick={(event) => {
            event.stopPropagation();
            dismiss();
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
