"use client";

import { Tag } from "@/components/Tag/Tag";
import { getHeroClassName, getHeroPrimaryLabel } from "@/helpers/ui/heroStyles";
import { formatExerciseShort } from "@/helpers/utils/calculate/workoutFormatters";
import { HeroProps } from "@/types/pages/homePage";

export default function Hero({
  hero,
  completedCount,
  upcomingCount,
  onPrimaryAction,
}: HeroProps) {
  const heroClass = getHeroClassName(hero);
  const primaryLabel = getHeroPrimaryLabel(hero);

  return (
    <section className={`${heroClass} fade-in relative`}>
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background:
            hero.kind === "missed"
              ? "radial-gradient(60% 55% at 30% 0%, rgba(250,204,21,0.18), transparent 65%)"
              : hero.kind === "upcoming"
                ? "radial-gradient(60% 55% at 30% 0%, rgba(34,197,94,0.22), transparent 65%)"
                : "radial-gradient(60% 55% at 30% 0%, rgba(255,255,255,0.06), transparent 65%)",
        }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-textSecondary">
            Today&apos;s workout
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold text-textPrimary flex items-center gap-2">
            {hero.title}
            {hero.kind === "missed" && <Tag label="Missed" />}
          </h1>

          <p className="text-sm md:text-base text-textSecondary capitalize">
            {hero.subtitle}
          </p>

          {hero.kind === "upcoming" && hero.workout && (
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
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #22c55e, #4ade80)",
                    }}
                  />
                  {formatExerciseShort(ex)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start md:items-end gap-3">
          <button
            onClick={onPrimaryAction}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-black active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
              boxShadow: "0 14px 45px rgba(34,197,94,0.45)",
            }}
          >
            {primaryLabel}
          </button>

          <p className="text-xs text-textSecondary">
            {completedCount} done · {upcomingCount} planned
          </p>
        </div>
      </div>
    </section>
  );
}
