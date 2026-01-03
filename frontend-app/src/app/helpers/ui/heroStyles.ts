import { HeroState } from "@/types/workout";
import clsx from "clsx";

export const getHeroClassName = (hero: HeroState) =>
  clsx(
    "rounded-3xl border border-borderSoft px-7 py-6 md:px-9 md:py-7 shadow-[0_24px_60px_rgba(0,0,0,0.8)] bg-gradient-to-r",
    {
      "from-warningYellow/35 via-bgHighlight to-bgMain": hero.kind === "missed",
      "from-accent/25 via-bgHighlight to-bgMain": hero.kind === "upcoming",
      "from-bgHighlight via-bgHighlight to-bgMain": hero.kind === "rest",
    }
  );

export const getHeroPrimaryLabel = (hero: HeroState) =>
  hero.kind === "missed"
    ? "Start make-up session"
    : hero.kind === "upcoming"
    ? "Start training"
    : "Add trainings";
