"use client";

import * as React from "react";
import clsx from "clsx";
import {
  InfoPanelItem,
  InfoPanelProps,
  Workout,
  Tip,
  Achievement,
  Highlights,
} from "@/types/types";
import { InfoPanelAnchor } from "./InfoPanelComponents/InfoPanelAnchor";
import { InfoPanelProgress } from "./InfoPanelComponents/InfoPanelProgress";
import { useTrainingData } from "./useData/useTrainingData";

export default function InfoPanel({
  title,
  link,
  items,
  displayExercises = false,
  desc,
  layout = "column",
  maxPerRow = 3,
  progress,
  dimOthers = false,
}: InfoPanelProps & { dimOthers?: boolean }) {
  const { mapExerciseToString } = useTrainingData();
  const isRow = layout === "row";

  const isWorkout = (i: InfoPanelItem): i is Workout =>
    typeof i === "object" && i !== null && "exercises" in i;

  const isHighlight = (i: InfoPanelItem): i is Highlights =>
    typeof i === "object" && i !== null && "rightPopup" in i;

  const isAchievement = (i: InfoPanelItem): i is Achievement =>
    typeof i === "object" &&
    i !== null &&
    "subtitle" in i &&
    !("rightPopup" in i) &&
    !("exercises" in i);

  const isTip = (i: InfoPanelItem): i is Tip =>
    typeof i === "object" &&
    i !== null &&
    "title" in i &&
    !("subtitle" in i) &&
    !("rightPopup" in i) &&
    !("exercises" in i);

  const hasHighlights =
    items.length > 0 && isHighlight(items[0] as InfoPanelItem);

  const useGrid = isRow && !hasHighlights;

  return (
    <section
      className={clsx(
        "bg-bgCard/95 border border-borderSoft rounded-3xl",
        "mt-0 px-6 py-5 md:px-7 md:py-6",
        "shadow-[0_20px_45px_rgba(0,0,0,0.65)]"
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="space-y-1">
          <h3 className="text-textPrimary text-xl md:text-2xl font-semibold tracking-tight">
            {title}
          </h3>
          {desc && (
            <p className="text-xs md:text-sm text-textSecondary">{desc}</p>
          )}
        </div>

        {link && <InfoPanelAnchor link={link.link} label={link.label} />}
      </div>

      {typeof progress === "number" && <InfoPanelProgress progress={progress} />}

      <div
        className={clsx(
          "mt-5",
          useGrid ? "grid gap-5" : "flex flex-col gap-3"
        )}
        style={
          useGrid
            ? ({
                gridTemplateColumns: `repeat(${Math.max(
                  1,
                  Math.floor(maxPerRow)
                )}, minmax(0, 1fr))`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {items.map((rawItem, index) => {
          const item = rawItem as InfoPanelItem;

          const workout = isWorkout(item);
          const tip = isTip(item);
          const achievement = isAchievement(item);
          const highlight = isHighlight(item);

          const isPrimaryWorkout = workout && index === 0 && dimOthers;

          return (
            <div
              key={index}
              className={clsx(
                "rounded-2xl border transition-colors duration-200",
                "px-5 py-4 md:px-6",
                useGrid ? "md:py-5" : "md:py-4",
                dimOthers && index !== 0
                  ? "opacity-40 hover:opacity-100"
                  : "opacity-100",
                "bg-bgHighlight/70 hover:bg-bgHighlight/90 border-borderSoft",
                tip && "bg-bgHighlight border-borderStrong",
                useGrid && achievement && "bg-infoBlue/55 border-infoBlue",
                isPrimaryWorkout &&
                  "bg-gradient-to-r from-infoBlue/55 to-bgHighlight border-infoBlue shadow-[0_0_28px_rgba(37,99,235,0.35)]",
                highlight && "flex items-center justify-between gap-4 w-full"
              )}
            >
              {workout && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-bgMain border border-borderSoft text-textPrimary text-xl">
                      🏋️
                    </div>
                    <div className="min-w-0">
                      <p className="text-textPrimary font-semibold text-base md:text-lg truncate">
                        {item.title}
                      </p>
                      <p className="text-[0.85rem] md:text-sm text-textSecondary capitalize mt-0.5">
                        {item.muscleGroup}
                      </p>

                      {displayExercises && item.exercises.length > 0 && (
                        <p className="text-[0.9rem] text-textPrimary mt-1.5 truncate">
                          {item.exercises
                            .map((ex) => mapExerciseToString(ex))
                            .join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {isPrimaryWorkout && (
                    <span className="inline-flex items-center rounded-full bg-accent px-3.5 py-1.5 text-xs md:text-sm font-semibold text-bgMain shrink-0">
                      Next up
                    </span>
                  )}
                </div>
              )}

              {tip && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bgMain border border-borderStrong text-textPrimary text-base">
                    i
                  </div>
                  <p className="text-sm md:text-base text-textPrimary">
                    {item.title}
                  </p>
                </div>
              )}

              {achievement && (
                <div className="flex flex-col h-full justify-between text-textPrimary">
                  <p className="text-xs md:text-sm text-textPrimary/90 uppercase tracking-wide">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="mt-2 text-2xl md:text-3xl font-semibold text-textPrimary">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              )}

              {highlight && (
                <>
                  <div className="min-w-0">
                    <p className="text-textPrimary font-medium text-sm md:text-base truncate">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[0.9rem] md:text-sm text-textSecondary truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-accent px-3.5 py-1.5 text-xs md:text-sm font-semibold text-bgMain border border-accent shrink-0">
                    {item.rightPopup}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
