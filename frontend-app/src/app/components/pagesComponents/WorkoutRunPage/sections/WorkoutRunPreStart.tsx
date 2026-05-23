import { estimateSetSeconds } from "@/helpers/utils/calculate/workoutRunEstimate";
import { Exercise } from "@/types/workout/workout";
import clsx from "clsx";
import { Clock3, Dumbbell, ListChecks, PlayCircle } from "lucide-react";
import { formatDuration, formatWeight } from "../workoutRunDisplay";

type WorkoutRunPreStartProps = {
  title?: string;
  focus: string;
  scheduledLabel?: string;
  exercises: Exercise[];
  isLoading: boolean;
  status: "idle" | "starting" | "running" | "saving" | "completed" | "error";
  errorMessage?: string;
  onStart: () => void;
};

export function WorkoutRunPreStart({
  title,
  focus,
  scheduledLabel,
  exercises,
  isLoading,
  status,
  errorMessage,
  onStart,
}: WorkoutRunPreStartProps) {
  const plannedSets = exercises.reduce(
    (acc, exercise) => acc + Math.max(1, exercise.sets || 0),
    0,
  );
  const plannedReps = exercises.reduce(
    (acc, exercise) =>
      acc + Math.max(1, exercise.sets || 0) * Math.max(1, exercise.reps || 0),
    0,
  );
  const plannedVolume = exercises.reduce(
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
      exercises.reduce((acc, exercise) => {
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

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
      <section className="rf-animate-panel rounded-2xl border border-borderSoft bg-[linear-gradient(135deg,rgba(27,43,52,0.96),rgba(14,22,30,0.95))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.36)] sm:p-6 md:rounded-xl md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-textMuted">
            <span>Ready to begin</span>
            {scheduledLabel && (
              <span className="rounded-full border border-borderSoft bg-bgHighlight/60 px-2.5 py-1 text-[11px] uppercase tracking-normal text-textSecondary">
                {scheduledLabel}
              </span>
            )}
          </div>
          <span className="rounded-full border border-accentBlue/30 bg-accentBlue/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-accentBlue">
            {exercises.length} exercises
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal sm:text-3xl md:text-4xl">
              {title ?? "Start training"}
            </h2>
            <p className="mt-2 text-sm text-textSecondary">
              {focus} - {plannedSets} sets - {plannedReps} reps
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 text-sm text-textPrimary">
              <span className="inline-flex min-h-10 items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5">
                <Clock3 size={15} className="mr-2 text-accent" />
                ~{estimatedMinutes} min
              </span>
              <span className="inline-flex min-h-10 items-center rounded-full border border-accentBlue/25 bg-accentBlue/10 px-3 py-1.5">
                <Dumbbell size={15} className="mr-2 text-accentBlue" />
                {plannedVolume.toLocaleString()} volume
              </span>
              <span className="inline-flex min-h-10 items-center rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5">
                <ListChecks size={15} className="mr-2 text-warning" />
                {exercises.length} items
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            className={clsx(
              "rf-btn-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition lg:w-auto",
              status === "starting"
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer",
            )}
            disabled={status === "starting"}
          >
            {status === "starting" ? (
              "Starting..."
            ) : (
              <>
                <PlayCircle size={18} />
                Start workout
              </>
            )}
          </button>
        </div>

        {errorMessage && <p className="mt-4 text-sm text-danger">{errorMessage}</p>}
      </section>

      <section className="rf-animate-panel rounded-2xl border border-borderSoft bg-bgCard/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:rounded-xl md:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
            Quick view
          </p>
          <div className="rounded-full border border-borderSoft px-3 py-1 text-xs text-textSecondary">
            {exercises.length} items
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 rounded-lg border border-borderSoft bg-bgHighlight/30 p-4 text-sm text-textSecondary">
            Loading details...
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {exercises.slice(0, 4).map((exercise, index) => (
              <div
                key={exercise.id}
                className="rounded-2xl border border-borderSoft bg-bgHighlight/25 px-4 py-3 md:rounded-lg"
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

            {exercises.length === 0 && (
              <div className="rounded-lg border border-dashed border-borderSoft bg-bgHighlight/20 p-4 text-sm text-textSecondary">
                No exercises yet.
              </div>
            )}

            {exercises.length > 4 && (
              <div className="text-xs text-textSecondary">
                +{exercises.length - 4} more
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
