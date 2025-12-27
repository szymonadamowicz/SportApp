"use client";
import InfoPanel from "../../InfoPanelComponents/InfoPanel";
import { useInfoData } from "../../../hooks/useInfoData";
import clsx from "clsx";
import { useWorkouts } from "@/hooks/useWorkouts";
import { formatExerciseShort } from "@/components/utils/workoutFormatters";
import { useHeroState } from "@/components/utils/workoutHero";
import Link from "next/link";

export default function HomePage() {
  const { tipsForTheDay, recentHighlightsData, weeklyProgressData } =
    useInfoData();

  const { all, completed, upcoming } = useWorkouts();

  const hero = useHeroState(all);

  const heroClass = clsx(
    "rounded-3xl border border-borderSoft px-7 py-6 md:px-9 md:py-7 shadow-[0_24px_60px_rgba(0,0,0,0.8)] bg-gradient-to-r",
    hero.kind === "missed"
      ? "from-warningYellow/35 via-bgHighlight to-bgMain"
      : hero.kind === "upcoming"
      ? "from-accent/25 via-bgHighlight to-bgMain"
      : "from-bgHighlight via-bgHighlight to-bgMain"
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
                {hero.title}

                {hero.kind === "missed" && (
                  <span className="inline-flex items-center rounded-full bg-warningYellow px-3 py-1 text-xs font-semibold text-bgMain">
                    Missed
                  </span>
                )}
              </h1>

              <p className="text-sm md:text-base text-textPrimary/85 capitalize">
                {hero.subtitle}
              </p>

              {hero.kind === "upcoming" && (
                <p className="text-xs md:text-sm text-textPrimary/85">
                  <span className="font-semibold">{hero.timeLabel}</span>
                </p>
              )}
            </div>

            {hero.kind === "upcoming" && hero.workout && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-textSecondary mb-2">
                  Exercises in this session
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 pr-2">
                  {hero.workout.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="shrink-0 rounded-2xl bg-bgCard/95 border border-borderSoft px-4 py-2 text-sm md:text-base text-textPrimary/90 whitespace-nowrap flex items-center gap-2"
                    >
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      <span>{formatExerciseShort(ex)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <Link
              href="/workouts"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm md:text-base font-semibold text-bgMain shadow-[0_12px_30px_rgba(22,163,74,0.55)] hover:bg-accentHover transition-colors"
            >
              {hero.kind === "missed"
                ? "Start make-up session"
                : hero.kind === "upcoming"
                ? "Start training"
                : "Add trainings"}
            </Link>

            <p className="text-xs text-textPrimary/80">
              {completed.length} done · {upcoming.length} upcoming
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col md:flex-row md:items-start md:gap-6">
        <div className="flex-1 flex flex-col gap-6">
          {upcoming.length > 0 ? (
            <InfoPanel
              title="Upcoming trainings"
              items={upcoming}
              link={{ link: "/workouts", label: "See All" }}
              dimOthers={upcoming[0] ? upcoming[0].id : undefined}
            />
          ) : (
            <section className="bg-bgCard border border-borderSoft rounded-2xl px-6 py-6 md:px-7 shadow-sm">
              <h3 className="text-textPrimary text-xl font-semibold">
                No more trainings planned 🎉
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
            desc={`sessions ${completed.length}/${
              completed.length + upcoming.length
            }`}
            progress={
              completed.length / (completed.length + upcoming.length || 1)
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
