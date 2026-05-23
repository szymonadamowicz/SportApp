"use client";

import { Tag } from "@/components/Tag/Tag";
import { getHeroClassName, getHeroPrimaryLabel } from "@/helpers/ui/heroStyles";
import { formatExerciseShort } from "@/helpers/utils/calculate/workoutFormatters";
import { HeroProps } from "@/types/pages/homePage";
import { WorkoutRunStart } from "@/types/workout/workoutRun";
import { Activity, Clock3 } from "lucide-react";

const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getPhaseLabel = (activeRun: WorkoutRunStart): string => {
  if (activeRun.activePhase === "rest") return "Rest";
  if (activeRun.activePhase === "summary") return "Summary";
  return "Exercise";
};

export default function Hero({
  hero,
  activeRun,
  activeElapsedSeconds = 0,
  completedCount,
  upcomingCount,
  onPrimaryAction,
}: HeroProps) {
  const hasActiveRun = Boolean(activeRun);
  const heroClass = hasActiveRun
    ? getHeroClassName("active")
    : getHeroClassName(hero);
  const primaryLabel = hasActiveRun
    ? "Continue workout"
    : getHeroPrimaryLabel(hero);

  const activeStep = activeRun?.steps[activeRun.currentStepIndex ?? 0];
  const loggedSets = activeRun?.entries.length ?? 0;
  const totalSets = activeRun?.steps.length ?? 0;
  const phaseLabel = activeRun ? getPhaseLabel(activeRun) : "";
  const activeTarget = activeStep
    ? `${activeStep.exerciseName} - set ${activeStep.setNumber}/${activeStep.totalSets}`
    : "No active set";

  const kicker = hasActiveRun
    ? "WORKOUT IN PROGRESS"
    : hero.kind === "upcoming"
      ? "NEXT TRAINING"
      : hero.kind === "missed"
        ? "MISSED TODAY"
        : "REST DAY";

  const hint = hasActiveRun
    ? "Session is still running. Keep going when you are ready."
    : hero.kind === "upcoming"
      ? "Stay consistent. Small wins compound."
      : hero.kind === "missed"
        ? "Let's get back on track."
        : "Recovery is part of progress.";

  const title = activeRun?.workoutTitle ?? hero.title;
  const subtitle = activeRun ? activeTarget : hero.subtitle;

  return (
    <section className={`${heroClass} rf-hero-reveal relative overflow-hidden`}>
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: hasActiveRun
            ? "radial-gradient(60% 55% at 30% 0%, rgba(45,212,191,0.2), transparent 65%)"
            : hero.kind === "missed"
              ? "radial-gradient(60% 55% at 30% 0%, rgba(250,204,21,0.18), transparent 65%)"
              : hero.kind === "upcoming"
                ? "radial-gradient(60% 55% at 30% 0%, rgba(34,197,94,0.22), transparent 65%)"
                : "radial-gradient(60% 55% at 30% 0%, rgba(255,255,255,0.06), transparent 65%)",
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.16em] text-textSecondary">
              {kicker}
            </p>
            {hasActiveRun && <Tag label="Live" />}
            {!hasActiveRun && hero.kind === "missed" && <Tag label="Missed" />}
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-textPrimary">
            {title}
          </h1>

          <p className="text-sm md:text-base text-textSecondary capitalize">
            {subtitle}
          </p>

          {hasActiveRun && activeRun ? (
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-cyan-100/75">
                  <Clock3 size={14} />
                  Time
                </div>
                <p className="mt-2 font-mono text-2xl font-black text-textPrimary">
                  {formatDuration(activeElapsedSeconds)}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] px-4 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-emerald-100/75">
                  <Activity size={14} />
                  Logged
                </div>
                <p className="mt-2 text-2xl font-black text-textPrimary">
                  {loggedSets}/{totalSets}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-textSecondary">
                  Phase
                </p>
                <p className="mt-2 text-lg font-bold text-textPrimary">
                  {phaseLabel}
                </p>
              </div>
            </div>
          ) : (
            hero.kind === "upcoming" &&
            hero.timeLabel && (
              <div
                className="inline-flex items-center gap-2 w-fit rounded-full px-3 py-1 text-xs text-textPrimary tabular-nums"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(26,31,36,0.9), rgba(19,23,27,0.85))",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="rf-pulse-dot h-2 w-2 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #4ade80)",
                    boxShadow: "0 0 0 3px rgba(34,197,94,0.12)",
                  }}
                />
                <span>{hero.timeLabel}</span>
              </div>
            )
          )}

          <p className="text-xs text-textSecondary">{hint}</p>

          {hasActiveRun && activeRun ? (
            <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
              {activeRun.steps.slice(0, 5).map((step) => {
                const isCurrent = step.stepIndex === activeStep?.stepIndex;

                return (
                  <div
                    key={step.stepIndex}
                    className="shrink-0 rounded-2xl px-4 py-2 text-sm flex items-center gap-2"
                    style={{
                      background: isCurrent
                        ? "linear-gradient(135deg, rgba(45,212,191,0.22), rgba(34,197,94,0.14))"
                        : "linear-gradient(180deg, rgba(26,31,36,0.9), rgba(19,23,27,0.85))",
                      border: isCurrent
                        ? "1px solid rgba(103,232,249,0.35)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: isCurrent
                          ? "linear-gradient(135deg, #67e8f9, #4ade80)"
                          : "rgba(148,163,184,0.55)",
                      }}
                    />
                    {step.exerciseName} {step.expectedReps} reps
                    {step.expectedWeight ? ` - ${step.expectedWeight} kg` : ""}
                  </div>
                );
              })}
            </div>
          ) : (
            hero.kind === "upcoming" &&
            hero.workout && (
              <div className="flex gap-3 overflow-x-auto pb-1 mt-4">
                {hero.workout.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="shrink-0 rounded-2xl px-4 py-2 text-sm flex items-center gap-2"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(26,31,36,0.9), rgba(19,23,27,0.85))",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      className="rf-pulse-dot h-2 w-2 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #22c55e, #4ade80)",
                      }}
                    />
                    {formatExerciseShort(ex)}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <button
            onClick={onPrimaryAction}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-black active:scale-[0.98]"
            style={{
              background: hasActiveRun
                ? "linear-gradient(135deg, #67e8f9, #4ade80)"
                : "linear-gradient(135deg, #22c55e, #4ade80)",
              boxShadow: hasActiveRun
                ? "0 14px 45px rgba(45,212,191,0.32)"
                : "0 14px 45px rgba(34,197,94,0.45)",
            }}
          >
            {primaryLabel}
          </button>

          <p className="text-xs text-textSecondary">
            {hasActiveRun
              ? `${loggedSets}/${totalSets} sets logged`
              : `${completedCount} done - ${upcomingCount} planned`}
          </p>
        </div>
      </div>
    </section>
  );
}
