import { WorkoutRunPageVM } from "@/types/pages/workoutRunPage";
import clsx from "clsx";
import { CheckCircle2, PlayCircle, RotateCcw, SkipForward } from "lucide-react";
import {
  formatDuration,
  formatWeight,
  metricCardClass,
} from "../workoutRunDisplay";

type WorkoutRunSetConsoleProps = {
  vm: WorkoutRunPageVM;
  phaseColor: string;
  nextStep: WorkoutRunPageVM["currentStep"];
};

export function WorkoutRunSetConsole({
  vm,
  phaseColor,
  nextStep,
}: WorkoutRunSetConsoleProps) {
  const previousDisabled = !vm.session || vm.currentStepIndex === 0;
  const skipCurrentDisabled = vm.phase === "summary" || !vm.session;
  const skipCurrentSection =
    vm.phase === "rest" ? vm.skipRest : vm.skipExercise;
  const skipCurrentLabel =
    vm.phase === "rest" ? "Start next set" : "Skip current set";

  return (
    <section className="rf-animate-panel rounded-2xl border border-borderSoft bg-bgCard/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:rounded-xl md:p-5">
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
            Set console
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {vm.phase === "rest"
              ? "Rest before next set"
              : vm.phase === "summary"
                ? "Ready to wrap up"
                : vm.currentStep?.exerciseName}
          </h2>
        </div>
        <span
          className="rounded-full border px-3 py-1 text-xs font-medium capitalize"
          style={{
            borderColor: `${phaseColor}66`,
            backgroundColor: `${phaseColor}1F`,
            color: phaseColor,
          }}
        >
          {vm.phase}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-borderSoft bg-bgHighlight/25 p-3 sm:p-4 md:rounded-lg">
        {vm.phase === "exercise" && vm.currentStep && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className={metricCardClass}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-textMuted">
                  Target reps
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {vm.currentStep.expectedReps}
                </p>
              </div>
              <div className={metricCardClass}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-textMuted">
                  Weight
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatWeight(vm.currentStep.expectedWeight)}
                </p>
              </div>
              <div className={metricCardClass}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-textMuted">
                  Set
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {vm.currentStep.setNumber}/{vm.currentStep.totalSets}
                </p>
              </div>
            </div>

            <div>
              <label
                className="text-xs font-medium uppercase tracking-[0.14em] text-textMuted"
                htmlFor="actual-reps"
              >
                Actual reps
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="actual-reps"
                  type="number"
                  value={vm.pendingActualReps}
                  onChange={(e) => vm.setPendingActualReps(e.target.value)}
                  className="rf-input-surface min-h-11 flex-1 rounded-xl px-3 py-2 text-sm md:rounded-lg"
                  placeholder={`Target: ${vm.currentStep.expectedReps}`}
                  min="0"
                />
                <button
                  type="button"
                  onClick={vm.saveSetAndContinue}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20 md:rounded-lg"
                >
                  <CheckCircle2 size={16} />
                  Done
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={vm.pendingMetTarget}
                onChange={(e) => vm.setPendingMetTarget(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-borderSoft bg-bgCard text-accent"
              />
              <span className="text-sm text-textPrimary">Target met</span>
            </label>
          </div>
        )}

        {vm.phase === "rest" && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className={metricCardClass}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-textMuted">
                  Rest target
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {vm.currentStep ? formatDuration(vm.currentStep.restSeconds) : "-"}
                </p>
              </div>
              <div className={metricCardClass}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-textMuted">
                  Next set
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {nextStep
                    ? `${nextStep.exerciseName} ${nextStep.setNumber}/${nextStep.totalSets}`
                    : "Summary"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={vm.skipRest}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-accentBlue/40 bg-accentBlue/10 px-4 py-2 text-sm font-semibold text-accentBlue transition hover:bg-accentBlue/20 sm:w-auto"
            >
              <PlayCircle size={16} />
              Start next set
            </button>
          </div>
        )}

        {vm.phase === "summary" && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-textSecondary">
            All planned sets are handled. Add notes and finish the workout from
            the right panel.
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={vm.goToPreviousStep}
          className={clsx(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition",
            previousDisabled
              ? "cursor-not-allowed opacity-45"
              : "cursor-pointer hover:border-borderStrong hover:bg-bgHighlight/30",
          )}
          disabled={previousDisabled}
        >
          <RotateCcw size={15} />
          Previous set
        </button>

        <button
          type="button"
          onClick={skipCurrentSection}
          className={clsx(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition",
            skipCurrentDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-borderStrong hover:bg-bgHighlight/30",
          )}
          disabled={skipCurrentDisabled}
        >
          <SkipForward size={15} />
          {skipCurrentLabel}
        </button>
      </div>
    </section>
  );
}
