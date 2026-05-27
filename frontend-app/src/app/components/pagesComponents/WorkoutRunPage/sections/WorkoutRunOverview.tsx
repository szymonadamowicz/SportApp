import { WorkoutRunPageVM } from "@/types/pages/workoutRunPage";
import clsx from "clsx";
import { CheckCircle2, ClipboardList, Timer } from "lucide-react";
import { metricCardClass } from "../workoutRunDisplay";

type WorkoutRunOverviewProps = {
  vm: WorkoutRunPageVM;
  totalSteps: number;
  stepsDone: number;
  metTargetSets: number;
  totalReps: number;
  onRequestFinish: () => void;
};

export function WorkoutRunOverview({
  vm,
  totalSteps,
  stepsDone,
  metTargetSets,
  totalReps,
  onRequestFinish,
}: WorkoutRunOverviewProps) {
  return (
    <section className="rf-animate-panel rounded-2xl border border-borderSoft bg-bgCard/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:rounded-xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Overview</h2>
        <span className="rounded-full border border-borderSoft bg-bgHighlight/30 px-3 py-1 text-xs text-textSecondary">
          {stepsDone}/{totalSteps} logged
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className={metricCardClass}>
          <p className="text-[10px] uppercase tracking-[0.12em] text-textMuted">
            Sets
          </p>
          <p className="text-lg font-semibold">
            {stepsDone}/{totalSteps}
          </p>
        </div>

        <div className={metricCardClass}>
          <p className="text-[10px] uppercase tracking-[0.12em] text-textMuted">
            Hit rate
          </p>
          <p className="text-lg font-semibold">
            {stepsDone === 0
              ? "0%"
              : `${Math.round((metTargetSets / stepsDone) * 100)}%`}
          </p>
        </div>

        <div className={metricCardClass}>
          <p className="text-[10px] uppercase tracking-[0.12em] text-textMuted">
            Reps
          </p>
          <p className="text-lg font-semibold">{totalReps}</p>
        </div>

        <div className={metricCardClass}>
          <p className="text-[10px] uppercase tracking-[0.12em] text-textMuted">
            Step
          </p>
          <p className="text-lg font-semibold">
            {vm.currentStep ? vm.currentStepIndex + 1 : 0}/{totalSteps}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-borderSoft bg-bgHighlight/20 p-3 md:rounded-lg">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-textMuted">
          <ClipboardList size={14} />
          History
        </p>

        <div className="rf-mobile-scroll mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
          {vm.session?.steps.map((step) => {
            const entry = vm.entries.find(
              (item) => item.stepIndex === step.stepIndex,
            );
            const isCurrent = step.stepIndex === vm.currentStepIndex;

            return (
              <div
                key={step.stepIndex}
                className={clsx(
                  "rounded-md border px-2 py-1.5 text-xs",
                  isCurrent
                    ? "border-accent/40 bg-accent/10"
                    : "border-borderSoft bg-bgCard/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{step.exerciseName}</span>
                  <span className="text-textMuted">
                    {entry
                      ? `${entry.actualReps}/${step.expectedReps} reps`
                      : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <label
        className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-textMuted"
        htmlFor="session-notes"
      >
        <Timer size={14} />
        Notes
      </label>
      <textarea
        id="session-notes"
        className="rf-input-surface mt-1 min-h-28 w-full rounded-2xl px-3 py-2 text-sm md:min-h-32 md:rounded-lg"
        placeholder="Notes..."
        value={vm.notes}
        onChange={(event) => vm.setNotes(event.target.value)}
      />

      <div className="rf-mobile-bottom-action mt-3 flex justify-end md:static md:bg-transparent md:p-0">
        <button
          type="button"
          onClick={onRequestFinish}
          className={clsx(
            "rf-btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold sm:w-auto",
            vm.status === "saving" || vm.status === "completed"
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer",
          )}
          disabled={vm.status === "saving" || vm.status === "completed"}
        >
          <CheckCircle2 size={16} />
          {vm.status === "saving" ? "Saving..." : "Finish workout"}
        </button>
      </div>

      {vm.summary && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
          <p className="text-xs font-semibold text-accent">Session saved</p>
          <p className="mt-1 text-xs text-textSecondary">
            {vm.summary.metTargetSets}/{vm.summary.totalSets} sets met target -{" "}
            {vm.summary.completionRate}%
          </p>
          <button
          type="button"
          onClick={vm.backToWorkouts}
          className="mt-2 min-h-10 w-full cursor-pointer rounded-full border border-borderSoft px-3 py-1.5 text-xs text-textPrimary transition hover:border-borderStrong hover:bg-bgHighlight/30 sm:w-auto"
          >
            Back to workouts
          </button>
        </div>
      )}

      {vm.errorMessage && (
        <p className="mt-3 text-xs text-danger">{vm.errorMessage}</p>
      )}
    </section>
  );
}
