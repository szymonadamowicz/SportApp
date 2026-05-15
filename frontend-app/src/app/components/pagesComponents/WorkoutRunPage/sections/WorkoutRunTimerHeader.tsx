import { WorkoutRunPageVM } from "@/types/pages/workoutRunPage";
import clsx from "clsx";
import { PauseCircle, PlayCircle } from "lucide-react";
import {
  formatClock,
  formatDuration,
  formatWeight,
  getPhaseLabel,
  metricCardClass,
} from "../workoutRunDisplay";

type WorkoutRunTimerHeaderProps = {
  vm: WorkoutRunPageVM;
  phaseColor: string;
  progressPercent: number;
  currentStepLabel: string;
  targetStep: WorkoutRunPageVM["currentStep"];
  totalSteps: number;
  stepsDone: number;
};

export function WorkoutRunTimerHeader({
  vm,
  phaseColor,
  progressPercent,
  currentStepLabel,
  targetStep,
  totalSteps,
  stepsDone,
}: WorkoutRunTimerHeaderProps) {
  const timerHint = vm.isPaused ? "Tap timer to resume" : "Tap timer to pause";
  const isTimerOver = vm.secondsLeft < 0;

  return (
    <section className="mb-6 rounded-xl border border-borderSoft bg-[linear-gradient(135deg,rgba(34,49,59,0.96),rgba(11,18,25,0.94))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.36)] md:p-5">
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <button
          type="button"
          onClick={vm.togglePause}
          disabled={vm.phase === "summary"}
          className={clsx(
            "group rounded-lg border p-5 text-left transition",
            vm.phase === "summary"
              ? "cursor-not-allowed border-borderSoft bg-bgCard/60 opacity-80"
              : "cursor-pointer border-borderSoft bg-bgCard/70 hover:border-borderStrong",
          )}
          title={timerHint}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">
                {getPhaseLabel(vm.phase)}
              </p>
              <p
                className="mt-2 text-6xl font-semibold tabular-nums tracking-normal md:text-7xl"
                style={{ color: phaseColor }}
              >
                {formatClock(vm.secondsLeft)}
              </p>
            </div>

            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border"
              style={{
                borderColor: `${phaseColor}66`,
                backgroundColor: `${phaseColor}1F`,
                color: phaseColor,
              }}
            >
              {vm.isPaused ? <PlayCircle size={22} /> : <PauseCircle size={22} />}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-bgHighlight/60">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent.toFixed(3)}%`,
                background: `linear-gradient(90deg, ${phaseColor}, #5eead4)`,
              }}
            />
          </div>

          <p className="mt-3 text-sm text-textSecondary">
            {vm.phase === "summary"
              ? "Review the workout and finish when ready."
              : isTimerOver
                ? `Over estimate - ${timerHint.toLowerCase()}`
                : timerHint}
          </p>
        </button>

        <div className="grid gap-3 md:grid-cols-2">
          <div className={metricCardClass}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-textMuted">
              {vm.phase === "rest" ? "Up next" : "Current target"}
            </p>
            <p className="mt-1 text-base font-semibold text-textPrimary">
              {currentStepLabel}
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              {targetStep
                ? `${targetStep.expectedReps} reps - ${formatWeight(targetStep.expectedWeight)}`
                : "No active set"}
            </p>
          </div>

          <div className={metricCardClass}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-textMuted">
              Session time
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {formatClock(vm.elapsedSeconds)}
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              {stepsDone}/{totalSteps} sets logged
            </p>
          </div>

          <div className={metricCardClass}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-textMuted">
              Estimated set
            </p>
            <p className="mt-1 text-lg font-semibold">
              {targetStep ? formatDuration(targetStep.exerciseSeconds) : "-"}
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              based on reps and load
            </p>
          </div>

          <div className={metricCardClass}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-textMuted">
              Planned rest
            </p>
            <p className="mt-1 text-lg font-semibold">
              {targetStep ? formatDuration(targetStep.restSeconds) : "-"}
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              timer can run past zero
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
