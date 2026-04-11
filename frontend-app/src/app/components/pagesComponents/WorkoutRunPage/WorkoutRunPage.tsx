"use client";

import { useState } from "react";
import { useWorkoutRunPageVM } from "./WorkoutRunPageVM";
import { useWorkoutById } from "@/hooks/apiHooks/workouts/useWorkoutById";
import { isSameDay, formatViewTime } from "@/helpers/utils/calculate/workoutTime";
import { ArrowLeft } from "lucide-react";
import { WorkoutRunFinishDialog } from "./sections/WorkoutRunFinishDialog";
import { WorkoutRunOverview } from "./sections/WorkoutRunOverview";
import { WorkoutRunPreStart } from "./sections/WorkoutRunPreStart";
import { WorkoutRunSetConsole } from "./sections/WorkoutRunSetConsole";
import { WorkoutRunTimerHeader } from "./sections/WorkoutRunTimerHeader";
import { WorkoutRunFormAnalysisPanel } from "./sections/WorkoutRunFormAnalysisPanel";
import { getPhaseColor } from "./workoutRunDisplay";

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
  const phaseColor = getPhaseColor(vm.phase);

  const nextStep = vm.session?.steps[vm.currentStepIndex + 1] ?? null;
  const targetStep = vm.phase === "rest" ? nextStep : vm.currentStep;
  const currentStepLabel = targetStep
    ? `${targetStep.exerciseName} - set ${targetStep.setNumber}/${targetStep.totalSets}`
    : vm.phase === "summary"
      ? "Session summary"
      : "Session ready";

  const plannedExercises = workout?.exercises ?? [];
  const workoutFocus =
    workout?.muscleGroups?.[0] ?? workout?.mainFocus ?? "Workout";
  const scheduledLabel = workout
    ? isSameDay(workout.scheduledAt, new Date())
      ? `Today, ${formatViewTime(workout.scheduledAt)}`
      : formatViewTime(workout.scheduledAt)
    : undefined;

  return (
    <div className="min-h-dvh text-textPrimary">
      <div className="mx-auto max-w-7xl px-3 py-[calc(1rem+env(safe-area-inset-top))] sm:px-4 md:px-8 md:py-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-textMuted">
              Workout Run Mode
            </p>
            <h1 className="truncate text-2xl font-semibold">
              {vm.session?.workoutTitle ?? "Start training"}
            </h1>
            <p className="mt-1 truncate text-sm text-textSecondary">
              {vm.session ? currentStepLabel : "Session ready"}
            </p>
          </div>

          <button
            type="button"
            onClick={vm.backToWorkouts}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-borderSoft bg-bgCard/70 px-4 py-2 text-sm text-textSecondary transition hover:border-borderStrong hover:text-textPrimary sm:w-auto"
          >
            <ArrowLeft size={16} />
            Back to workouts
          </button>
        </div>

        {vm.session && (
          <WorkoutRunTimerHeader
            vm={vm}
            phaseColor={phaseColor}
            progressPercent={progressPercent}
            currentStepLabel={currentStepLabel}
            targetStep={targetStep}
            totalSteps={totalSteps}
            stepsDone={stepsDone}
          />
        )}

        {!vm.session && (
          <WorkoutRunPreStart
            title={workout?.title}
            focus={workoutFocus}
            scheduledLabel={scheduledLabel}
            exercises={plannedExercises}
            isLoading={workoutLoading}
            status={vm.status}
            errorMessage={vm.errorMessage}
            onStart={vm.startSession}
          />
        )}

        {vm.session && (
          <div className="space-y-6">
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.95fr]">
              <WorkoutRunSetConsole
                vm={vm}
                phaseColor={phaseColor}
                nextStep={nextStep}
              />

              <WorkoutRunOverview
                vm={vm}
                totalSteps={totalSteps}
                stepsDone={stepsDone}
                metTargetSets={metTargetSets}
                totalReps={totalReps}
                onRequestFinish={() => setShowFinishConfirm(true)}
              />
            </div>

            <WorkoutRunFormAnalysisPanel
              currentExerciseName={targetStep?.exerciseName}
              workoutRunId={vm.session.runId}
              workoutId={vm.session.workoutId}
              currentStep={targetStep}
            />
          </div>
        )}

        {showFinishConfirm && (
          <WorkoutRunFinishDialog
            onCancel={() => setShowFinishConfirm(false)}
            onConfirm={() => {
              setShowFinishConfirm(false);
              void vm.finishSession();
            }}
          />
        )}
      </div>
    </div>
  );
}
