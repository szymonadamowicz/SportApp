import clsx from "clsx";
import { HeroState } from "@/types/workout/workout";

export const getHeroClassName = (hero: HeroState | "active") => {
  const isActive = hero === "active";

  return clsx(
    "rf-surface-panel rf-hover-lift rounded-3xl px-5 py-6 sm:px-7 md:px-9 md:py-7",
    {
      "rf-state-upcoming": isActive || (!isActive && hero.kind === "upcoming"),
      "rf-state-missed": !isActive && hero.kind === "missed",
      "state-highlight": !isActive && hero.kind === "rest",
    },
  );
};

export const getHeroPrimaryLabel = (hero: HeroState) =>
  hero.kind === "missed"
    ? "Start make-up session"
    : hero.kind === "upcoming"
      ? "Start training"
      : "Add trainings";
