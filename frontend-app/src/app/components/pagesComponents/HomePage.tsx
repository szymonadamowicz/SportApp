import InfoPanel from "../InfoPanel";
import { useInfoData } from "../useData/useInfoData";
import { useTrainingData } from "../useData/useTrainingData";
import clsx from "clsx";

export default function HomePage() {
  const { WorkoutsDone, WorkoutsLeft, mapExerciseToString } = useTrainingData();
  const { tipsForTheDay, recentHighlightsData, weeklyProgressData } =
    useInfoData();

  const now = new Date();

  const sortedLeft = [...WorkoutsLeft].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return da - db;
  });

  const isMissedToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return (
      d.toDateString() === now.toDateString() && d.getTime() <= now.getTime()
    );
  };

  const nextWorkout = sortedLeft[0];

  const upcomingLeft = sortedLeft.filter((w) => {
    if (!w.date) return true;
    const d = new Date(w.date);
    return d.getTime() > now.getTime();
  });

  const leftCount = upcomingLeft.length;

  let heroStatus: "none" | "upcoming" | "missed" = "none";
  let timeLeftLabel: string | null = null;

  if (nextWorkout && nextWorkout.date) {
    const wDate = new Date(nextWorkout.date);

    if (wDate > now) {
      heroStatus = "upcoming";

      const diffMs = wDate.getTime() - now.getTime();
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

      timeLeftLabel = parts.join(" ");
    } else if (isMissedToday(nextWorkout.date)) {
      heroStatus = "missed";
    }
  }

  const heroClass = clsx(
    "mt-6 rounded-3xl border border-borderSoft px-7 py-6 md:px-9 md:py-7 shadow-[0_24px_60px_rgba(0,0,0,0.8)] bg-gradient-to-r",
    heroStatus === "missed"
      ? "from-warningYellow/35 via-bgHighlight to-bgMain"
      : "from-accent/25 via-bgHighlight to-bgMain"
  );

  return (
    <>
      <section className={heroClass}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs md:text-sm uppercase tracking-[0.16em] text-textSecondary/90">
              Today&apos;s workout
            </p>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-textPrimary tracking-tight flex items-center gap-2">
                {nextWorkout ? nextWorkout.title : "No workout scheduled"}
                {heroStatus === "missed" && (
                  <span className="inline-flex items-center rounded-full bg-warningYellow px-3 py-1 text-xs font-semibold text-bgMain">
                    Missed
                  </span>
                )}
              </h1>

              <p className="text-sm md:text-base text-textPrimary/85 capitalize">
                {nextWorkout
                  ? nextWorkout.muscleGroup
                  : "Plan your next session and keep the streak alive."}
              </p>

              {heroStatus === "upcoming" && timeLeftLabel && (
                <p className="text-xs md:text-sm text-textPrimary/85">
                  Starts in{" "}
                  <span className="font-semibold">{timeLeftLabel}</span>
                </p>
              )}
            </div>

            {nextWorkout && nextWorkout.exercises.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-textSecondary mb-2">
                  Exercises in this session
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 pr-2">
                  {nextWorkout.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="shrink-0 rounded-2xl bg-bgCard/95 border border-borderSoft px-4 py-2 text-sm md:text-base text-textPrimary/90 whitespace-nowrap flex items-center gap-2"
                    >
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      <span>{mapExerciseToString(ex)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <a
              href="/workouts"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm md:text-base font-semibold text-bgMain shadow-[0_12px_30px_rgba(22,163,74,0.55)] hover:bg-accentHover transition-colors"
            >
              {heroStatus === "missed"
                ? "Start make-up session"
                : "Start training"}
            </a>
            <p className="text-xs text-textPrimary/80">
              {WorkoutsDone.length} done · {leftCount} left this week
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col md:flex-row md:items-start md:gap-6">
        <div className="flex-1 flex flex-col gap-6">
          {upcomingLeft.length > 0 ? (
            <InfoPanel
              title="Trainings left this week"
              items={upcomingLeft}
              dimOthers={true}
            />
          ) : (
            <section className="bg-bgCard border border-borderSoft rounded-2xl px-6 py-6 md:px-7 shadow-sm">
              <h3 className="text-textPrimary text-xl font-semibold">
                No more trainings this week 🎉
              </h3>

              <div className="mt-4 text-center">
                <p className="text-textSecondary text-sm">
                  Great job! You finished all your planned sessions.
                </p>
              </div>
            </section>
          )}

          <InfoPanel title="Tips for the day" items={tipsForTheDay} />
        </div>

        <div className="flex-1 flex flex-col gap-6 mt-6 md:mt-0">
          <InfoPanel
            title="Week progress"
            desc={`sessions ${WorkoutsDone.length}/${
              WorkoutsLeft.length + WorkoutsDone.length
            }`}
            progress={
              WorkoutsDone.length /
              (WorkoutsLeft.length + WorkoutsDone.length || 1)
            }
            items={weeklyProgressData}
            layout="row"
            maxPerRow={3}
          />

          <InfoPanel
            title="Recent highlights"
            link={{ link: "/highlights", label: "See All" }}
            items={recentHighlightsData}
            layout="column"
          />
        </div>
      </div>
    </>
  );
}
