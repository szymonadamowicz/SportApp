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
} from "@/types/workout";
import { InfoPanelAnchor } from "./InfoPanelAnchor";
import { InfoPanelProgress } from "./InfoPanelProgress";
import { parseCommaSeparatedList } from "../utils/workoutParsers";
import { formatExerciseShort } from "../utils/workoutFormatters";


export default function InfoPanel({
  title,
  link,
  items,
  displayExercises = false,
  desc,
  layout = "column",
  maxPerRow = 3,
  progress,
  dimOthers,
  showButton,
  variant = "default",
  onUpdateExercise,
}: InfoPanelProps) {
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

  const editInputClass =
    "bg-bgHighlight/40 border border-borderSoft rounded-md px-2 py-1 " +
    "hover:bg-bgHighlight/60 " +
    "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition";

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

        <div className="flex items-center gap-3 shrink-0">
          {link && <InfoPanelAnchor link={link.link} label={link.label} />}
          {showButton && (variant === "exercises" || variant === "exercise_edit") && (
            <button
              onClick={() => showButton.onClick((items[0] as Workout).id)}
              className="px-4 py-2 bg-accent text-bgMain font-semibold rounded-lg shadow-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
            >
              {showButton.label}
            </button>
          )}
        </div>
      </div>

      {typeof progress === "number" && (
        <InfoPanelProgress progress={progress} />
      )}

      <div
        className={clsx(
          "mt-5",
          variant === "exercises"
            ? "flex flex-col gap-4"
            : useGrid
            ? "grid gap-5"
            : "flex flex-col gap-3"
        )}
        style={
          useGrid && variant !== "exercises"
            ? ({
                gridTemplateColumns: `repeat(${Math.max(
                  1,
                  Math.floor(maxPerRow)
                )}, minmax(0, 1fr))`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {(variant === "exercises" || variant === "exercise_edit") &&
        items.length > 0 &&
        isWorkout(items[0] as InfoPanelItem) ? (
          <div className="space-y-4 w-full">
            {(items[0] as Workout).exercises.map((exercise, idx) => (
              <div
                key={exercise.id}
                className="rounded-2xl border border-borderSoft bg-gradient-to-br from-bgHighlight/60 to-bgHighlight/30 hover:from-bgHighlight/80 hover:to-bgHighlight/50 transition-all duration-200 px-6 py-5 md:px-7 md:py-6 shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-semibold text-sm">
                          {idx + 1}
                        </span>

                        {variant === "exercises" ? (
                          <p className="text-textPrimary font-bold text-xl md:text-2xl">
                            {exercise.name}
                          </p>
                        ) : (
                          <input
                            defaultValue={exercise.name}
                            className="w-full bg-transparent text-textPrimary font-bold text-xl md:text-2xl border-b border-borderSoft focus:outline-none focus:border-accent"
                          />
                        )}
                      </div>

                      {variant === "exercises" ? (
                        <p className="text-base md:text-lg text-accent font-semibold ml-11">
                          {exercise.reps} reps × {exercise.sets} sets
                          {exercise.weight && exercise.weight > 0 && (
                            <span className="ml-3 text-textSecondary font-medium">
                              @ {exercise.weight}kg
                            </span>
                          )}
                        </p>
                      ) : (
                        <div className="ml-11 flex flex-wrap items-center gap-3">
                          <input
                            type="number"
                            defaultValue={exercise.reps}
                            onBlur={(e) =>
                              onUpdateExercise?.(exercise.id, {
                                reps: Number(e.target.value),
                              })
                            }
                            className={`w-20 text-accent font-semibold ${editInputClass}`}
                            placeholder="Reps"
                          />

                          <span className="text-textSecondary">×</span>

                          <input
                            type="number"
                            defaultValue={exercise.sets}
                            onBlur={(e) =>
                              onUpdateExercise?.(exercise.id, {
                                sets: Number(e.target.value),
                              })
                            }
                            className={`w-20 text-accent font-semibold ${editInputClass}`}
                            placeholder="Sets"
                          />

                          <span className="text-textSecondary">@</span>

                          <input
                            type="number"
                            defaultValue={exercise.weight}
                            onBlur={(e) =>
                              onUpdateExercise?.(exercise.id, {
                                weight: Number(e.target.value),
                              })
                            }
                            className={`w-24 text-textSecondary font-medium ${editInputClass}`}
                            placeholder="kg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-11 space-y-3 border-t border-borderSoft/50 pt-4">
                    {exercise.muscleGroups && (
                      <div className="space-y-1">
                        <p className="text-sm text-textSecondary font-medium uppercase tracking-wide">
                          Muscle Groups Targeted
                        </p>

                        {variant === "exercises" ? (
                          <p className="text-base text-textPrimary font-semibold">
                            {exercise.muscleGroups.join(", ")}
                          </p>
                        ) : (
                          <input
                            defaultValue={exercise.muscleGroups.join(", ")}
                            onBlur={(e) =>
                              onUpdateExercise?.(exercise.id, {
                                muscleGroups: parseCommaSeparatedList(
                                  e.target.value
                                ),
                              })
                            }
                            className={`w-full font-semibold ${editInputClass}`}
                            placeholder="Chest, Triceps, Shoulders"
                          />
                        )}
                      </div>
                    )}

                    {exercise.restTimeSec && (
                      <div className="space-y-1">
                        <p className="text-sm text-textSecondary font-medium uppercase tracking-wide">
                          Rest Time
                        </p>

                        {variant === "exercises" ? (
                          <p className="text-base text-accent font-semibold">
                            {exercise.restTimeSec}s
                          </p>
                        ) : (
                          <input
                            type="number"
                            defaultValue={exercise.restTimeSec}
                            onBlur={(e) =>
                              onUpdateExercise?.(exercise.id, {
                                restTimeSec: Number(e.target.value),
                              })
                            }
                            className={`w-24 text-accent font-semibold ${editInputClass}`}
                            placeholder="sec"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          items.map((rawItem, index) => {
            const item = rawItem as InfoPanelItem;

            const workout = isWorkout(item);
            const tip = isTip(item);
            const achievement = isAchievement(item);
            const highlight = isHighlight(item);

            const isPrimaryWorkout = workout && index === 0;
            const isSelectedWorkout =
              workout && (item as Workout).id === dimOthers;

            return (
              <div
                key={index}
                className={clsx(
                  "rounded-2xl border transition-colors duration-200",
                  "px-5 py-4 md:px-6",
                  useGrid ? "md:py-5" : "md:py-4",
                  dimOthers && workout && (item as Workout).id !== dimOthers
                    ? "opacity-40 hover:opacity-100"
                    : "opacity-100",
                  "bg-bgHighlight/70 hover:bg-bgHighlight/90 border-borderSoft",
                  tip && "bg-bgHighlight border-borderStrong",
                  useGrid && achievement && "bg-infoBlue/55 border-infoBlue",
                  isSelectedWorkout &&
                    "bg-gradient-to-r from-infoBlue/55 to-bgHighlight border-infoBlue shadow-[0_0_28px_rgba(37,99,235,0.35)]",
                  highlight && "flex items-center justify-between gap-4 w-full"
                )}
              >
                {workout && (
                  <div className="flex items-start justify-between gap-4">
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
                              .map((ex) => formatExerciseShort(ex))
                              .join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {isPrimaryWorkout && (
                        <span className="inline-flex items-center rounded-full bg-accent px-3.5 py-1.5 text-xs md:text-sm font-semibold text-bgMain">
                          Next up
                        </span>
                      )}
                      {showButton && variant !== "exercises" && workout && (
                        <button
                          onClick={() =>
                            showButton.onClick((item as Workout).id)
                          }
                          className="px-4 py-2 bg-accent text-bgMain font-semibold rounded-lg shadow-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
                        >
                          {showButton.label}
                        </button>
                      )}
                    </div>
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
          })
        )}
      </div>
    </section>
  );
}
