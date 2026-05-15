"use client";

import clsx from "clsx";
import { useState } from "react";
import { useWorkoutRunPageVM } from "./WorkoutRunPageVM";
import { useWorkoutById } from "@/hooks/apiHooks/workouts/useWorkoutById";
import { isSameDay, formatViewTime } from "@/helpers/utils/calculate/workoutTime";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Dumbbell,
  ListChecks,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  SkipForward,
  Timer,
} from "lucide-react";

const formatClock = (seconds: number): string => {
  const prefix = seconds < 0 ? "+" : "";
  const safeSeconds = Math.abs(seconds);
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${prefix}${mins}:${secs}`;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins <= 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

const formatWeight = (weight?: number | null): string => {
  if (!weight || weight <= 0) return "bodyweight";
  return `${Number(weight.toFixed(1)).toLocaleString()} kg`;
};

const estimateSetSeconds = (reps: number, weight?: number): number => {
  const safeReps = Math.max(1, reps || 1);
  const safeWeight = Math.max(0, weight || 0);
  const secondsPerRep = safeReps <= 5 ? 5 : safeReps <= 10 ? 4 : 3;
  const loadAdjustment =
    safeWeight <= 0 ? 0 : safeWeight < 40 ? 4 : safeWeight < 80 ? 8 : 12;

  return Math.max(
    20,
    Math.min(180, 10 + safeReps * secondsPerRep + loadAdjustment),
  );
};

const getPhaseColor = (phase: "exercise" | "rest" | "summary") => {
  if (phase === "exercise") return "#34d399";
  if (phase === "rest") return "#38bdf8";
  return "#f59e0b";
};

const getPhaseLabel = (phase: "exercise" | "rest" | "summary") => {
  if (phase === "exercise") return "Set estimate";
  if (phase === "rest") return "Rest timer";
  return "Session summary";
};

const metricCardClass =
  "rounded-lg border border-borderSoft bg-bgHighlight/30 px-3 py-2";

export default function WorkoutRunPage({ workoutId }: { workoutId: string }) {
  const vm = useWorkoutRunPageVM(workoutId);
  const { workoutById: workout, isLoading: workoutLoading } =
    useWorkoutById(workoutId);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const totalSteps = vm.session?.steps.length ?? 0;
  const stepsDone = vm.entries.length;
  const metTargetSets = vm.entries.filter((entry) => entry.metTarget).length;
  const totalReps = vm.entries.reduce(
    (acc, entry) => acc + entry.actualReps,
    0,
  );
  const progressPercent = Math.min(100, Math.max(0, vm.phaseProgress * 100));
  const workoutTimeLabel = formatClock(vm.elapsedSeconds);
  const phaseColor = getPhaseColor(vm.phase);
  const isTimerOver = vm.secondsLeft < 0;

  const previousDisabled = !vm.session || vm.currentStepIndex === 0;
  const skipCurrentDisabled = vm.phase === "summary" || !vm.session;
  const skipCurrentSection =
    vm.phase === "rest" ? vm.skipRest : vm.skipExercise;
  const skipCurrentLabel =
    vm.phase === "rest" ? "Start next set" : "Skip current set";
  const timerHint = vm.isPaused ? "Tap timer to resume" : "Tap timer to pause";

  const nextStep = vm.session?.steps[vm.currentStepIndex + 1] ?? null;
  const targetStep = vm.phase === "rest" ? nextStep : vm.currentStep;
  const currentStepLabel = targetStep
    ? `${targetStep.exerciseName} - set ${targetStep.setNumber}/${targetStep.totalSets}`
    : vm.phase === "summary"
      ? "Session summary"
      : "Session ready";

  const plannedExercises = workout?.exercises ?? [];
  const plannedSets = plannedExercises.reduce(
    (acc, exercise) => acc + Math.max(1, exercise.sets || 0),
    0,
  );
  const plannedReps = plannedExercises.reduce(
    (acc, exercise) =>
      acc + Math.max(1, exercise.sets || 0) * Math.max(1, exercise.reps || 0),
    0,
  );
  const plannedVolume = plannedExercises.reduce(
    (acc, exercise) =>
      acc +
      Math.max(1, exercise.sets || 0) *
        Math.max(1, exercise.reps || 0) *
        Math.max(0, exercise.weight ?? 0),
    0,
  );
  const estimatedMinutes = Math.max(
    1,
    Math.round(
      plannedExercises.reduce((acc, exercise) => {
        const setCount = Math.max(1, exercise.sets || 0);
        const restSeconds = Math.max(15, exercise.restTimeSec || 60);
        return (
          acc +
          setCount *
            (estimateSetSeconds(exercise.reps, exercise.weight) + restSeconds)
        );
      }, 0) / 60,
    ),
  );
  const workoutFocus =
    workout?.muscleGroups?.[0] ?? workout?.mainFocus ?? "Workout";
  const scheduledLabel = workout
    ? isSameDay(workout.scheduledAt, new Date())
      ? `Today, ${formatViewTime(workout.scheduledAt)}`
      : formatViewTime(workout.scheduledAt)
    : undefined;

  return (
    <div className="min-h-screen text-textPrimary">
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-textMuted">
              Workout Run Mode
            </p>
            <h1 className="text-2xl font-semibold">
              {vm.session?.workoutTitle ?? "Start training"}
            </h1>
            <p className="mt-1 text-sm text-textSecondary">
              {vm.session ? currentStepLabel : "Session ready"}
            </p>
          </div>

          <button
            type="button"
            onClick={vm.backToWorkouts}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-borderSoft bg-bgCard/70 px-4 py-2 text-sm text-textSecondary transition hover:border-borderStrong hover:text-textPrimary"
          >
            <ArrowLeft size={16} />
            Back to workouts
          </button>
        </div>

        {vm.session && (
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
                    {vm.isPaused ? (
                      <PlayCircle size={22} />
                    ) : (
                      <PauseCircle size={22} />
                    )}
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
                    {workoutTimeLabel}
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
        )}

        {!vm.session && (
          <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-xl border border-borderSoft bg-[linear-gradient(135deg,rgba(27,43,52,0.96),rgba(14,22,30,0.95))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.36)] md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-textMuted">
                  <span>Ready to begin</span>
                  {scheduledLabel && (
                    <span className="rounded-full border border-borderSoft bg-bgHighlight/60 px-2.5 py-1 text-[11px] uppercase tracking-normal text-textSecondary">
                      {scheduledLabel}
                    </span>
                  )}
                </div>
                <span className="rounded-full border border-accentBlue/30 bg-accentBlue/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-accentBlue">
                  {plannedExercises.length} exercises
                </span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-3xl font-semibold tracking-normal md:text-4xl">
                    {workout?.title ?? "Start training"}
                  </h2>
                  <p className="mt-2 text-sm text-textSecondary">
                    {workoutFocus} - {plannedSets} sets - {plannedReps} reps
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2.5 text-sm text-textPrimary">
                    <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5">
                      <Clock3 size={15} className="mr-2 text-accent" />
                      ~{estimatedMinutes} min
                    </span>
                    <span className="inline-flex items-center rounded-full border border-accentBlue/25 bg-accentBlue/10 px-3 py-1.5">
                      <Dumbbell size={15} className="mr-2 text-accentBlue" />
                      {plannedVolume.toLocaleString()} volume
                    </span>
                    <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5">
                      <ListChecks size={15} className="mr-2 text-warning" />
                      {plannedExercises.length} items
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={vm.startSession}
                  className={clsx(
                    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition rf-btn-primary",
                    vm.status === "starting"
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                  )}
                  disabled={vm.status === "starting"}
                >
                  {vm.status === "starting" ? (
                    "Starting..."
                  ) : (
                    <>
                      <PlayCircle size={18} />
                      Start workout
                    </>
                  )}
                </button>
              </div>

              {vm.errorMessage && (
                <p className="mt-4 text-sm text-danger">{vm.errorMessage}</p>
              )}
            </section>

            <section className="rounded-xl border border-borderSoft bg-bgCard/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
                  Quick view
                </p>
                <div className="rounded-full border border-borderSoft px-3 py-1 text-xs text-textSecondary">
                  {plannedExercises.length} items
                </div>
              </div>

              {workoutLoading ? (
                <div className="mt-4 rounded-lg border border-borderSoft bg-bgHighlight/30 p-4 text-sm text-textSecondary">
                  Loading details...
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {plannedExercises.slice(0, 4).map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="rounded-lg border border-borderSoft bg-bgHighlight/25 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.12em] text-accentBlue">
                            #{index + 1}
                          </p>
                          <p className="mt-1 text-sm font-medium text-textPrimary">
                            {exercise.name}
                          </p>
                          <p className="mt-1 text-xs text-textSecondary">
                            {formatWeight(exercise.weight)} - rest{" "}
                            {formatDuration(Math.max(15, exercise.restTimeSec || 60))}
                          </p>
                        </div>
                        <span className="text-xs text-textSecondary">
                          {exercise.sets}x{exercise.reps}
                        </span>
                      </div>
                    </div>
                  ))}

                  {plannedExercises.length === 0 && (
                    <div className="rounded-lg border border-dashed border-borderSoft bg-bgHighlight/20 p-4 text-sm text-textSecondary">
                      No exercises yet.
                    </div>
                  )}

                  {plannedExercises.length > 4 && (
                    <div className="text-xs text-textSecondary">
                      +{plannedExercises.length - 4} more
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {vm.session && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.95fr]">
            <section className="rounded-xl border border-borderSoft bg-bgCard/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:p-5">
              <div className="flex items-center justify-between gap-3">
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

              <div className="mt-4 rounded-lg border border-borderSoft bg-bgHighlight/25 p-4">
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
                      <div className="mt-2 flex gap-2">
                        <input
                          id="actual-reps"
                          type="number"
                          value={vm.pendingActualReps}
                          onChange={(e) =>
                            vm.setPendingActualReps(e.target.value)
                          }
                          className="rf-input-surface min-h-11 flex-1 rounded-lg px-3 py-2 text-sm"
                          placeholder={`Target: ${vm.currentStep.expectedReps}`}
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={vm.saveSetAndContinue}
                          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-accent/30 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20"
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
                        onChange={(e) =>
                          vm.setPendingMetTarget(e.target.checked)
                        }
                        className="h-4 w-4 cursor-pointer rounded border-borderSoft bg-bgCard text-accent"
                      />
                      <span className="text-sm text-textPrimary">
                        Target met
                      </span>
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
                          {vm.currentStep
                            ? formatDuration(vm.currentStep.restSeconds)
                            : "-"}
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
                      className="inline-flex items-center gap-2 rounded-full border border-accentBlue/40 bg-accentBlue/10 px-4 py-2 text-sm font-semibold text-accentBlue transition hover:bg-accentBlue/20"
                    >
                      <PlayCircle size={16} />
                      Start next set
                    </button>
                  </div>
                )}

                {vm.phase === "summary" && (
                  <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-textSecondary">
                    All planned sets are handled. Add notes and finish the
                    workout from the right panel.
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={vm.goToPreviousStep}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition",
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
                    "inline-flex items-center gap-2 rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition",
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

            <section className="rounded-xl border border-borderSoft bg-bgCard/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
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

              <div className="mt-3 rounded-lg border border-borderSoft bg-bgHighlight/20 p-3">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-textMuted">
                  <ClipboardList size={14} />
                  History
                </p>

                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-1">
                  {vm.session.steps.map((step) => {
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
                          <span className="font-medium">
                            {step.exerciseName}
                          </span>
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
                className="rf-input-surface mt-1 min-h-32 w-full rounded-lg px-3 py-2 text-sm"
                placeholder="Notes..."
                value={vm.notes}
                onChange={(event) => vm.setNotes(event.target.value)}
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowFinishConfirm(true)}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold rf-btn-primary",
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
                  <p className="text-xs font-semibold text-accent">
                    Session saved
                  </p>
                  <p className="mt-1 text-xs text-textSecondary">
                    {vm.summary.metTargetSets}/{vm.summary.totalSets} sets met
                    target - {vm.summary.completionRate}%
                  </p>
                  <button
                    type="button"
                    onClick={vm.backToWorkouts}
                    className="mt-2 cursor-pointer rounded-full border border-borderSoft px-3 py-1.5 text-xs text-textPrimary transition hover:border-borderStrong hover:bg-bgHighlight/30"
                  >
                    Back to workouts
                  </button>
                </div>
              )}

              {vm.errorMessage && (
                <p className="mt-3 text-xs text-danger">{vm.errorMessage}</p>
              )}
            </section>
          </div>
        )}

        {showFinishConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-borderSoft bg-bgCard p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
              <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
                Finish workout
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Finish this workout?
              </h3>
              <p className="mt-2 text-sm text-textSecondary">
                Current progress and notes will be saved to this session.
              </p>

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFinishConfirm(false)}
                  className="rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition hover:border-borderStrong hover:bg-bgHighlight/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFinishConfirm(false);
                    void vm.finishSession();
                  }}
                  className="rounded-full px-4 py-2 text-sm font-semibold rf-btn-primary"
                >
                  Yes, finish workout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
