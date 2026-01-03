"use client";

import Tag from "@/components/Tag/Tag";
import { getHeroClassName, getHeroPrimaryLabel } from "@/helpers/ui/heroStyles";
import { formatExerciseShort } from "@/helpers/utils/workoutFormatters";
import { HeroProps } from "@/types/homePage";

export default function Hero({
  hero,
  completedCount,
  upcomingCount,
  onPrimaryAction,
}: HeroProps) {
  const heroClass = getHeroClassName(hero);
  const primaryLabel = getHeroPrimaryLabel(hero);
  return (
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
                <Tag label="Missed" className="bg-warningYellow text-bgMain" />
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
          <button
            onClick={onPrimaryAction}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm md:text-base font-semibold text-bgMain shadow-[0_12px_30px_rgba(22,163,74,0.55)] hover:bg-accentHover transition-colors"
          >
            {primaryLabel}
          </button>

          <p className="text-xs text-textPrimary/80">
            {completedCount} done · {upcomingCount} upcoming
          </p>
        </div>
      </div>
    </section>
  );
}
