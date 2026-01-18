import { HeroState } from "@/types/workout/workout";
import clsx from "clsx";

export const getHeroClassName = (hero: HeroState) =>
  clsx("glass-panel card-hover rounded-3xl px-7 py-6 md:px-9 md:py-7", {
    "state-upcoming": hero.kind === "upcoming",
    "state-missed": hero.kind === "missed",
    "state-highlight": hero.kind === "rest",
  });

export const getHeroPrimaryLabel = (hero: HeroState) =>
  hero.kind === "missed"
    ? "Start make-up session"
    : hero.kind === "upcoming"
      ? "Start training"
      : "Add trainings";
