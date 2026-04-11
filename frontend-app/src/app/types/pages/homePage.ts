import { ProgressAchievements } from "@/types/progress/progress";
import { HeroState, Highlights, Tip, Workout } from "../workout/workout";

export interface HeroProps {
  hero: HeroState;
  completedCount: number;
  upcomingCount: number;
  onPrimaryAction: () => void;
}

export interface HomePageVM {
  hero: HeroState;
  now: Date;

  statsWeekly: {
    completedCount: number;
    plannedCount: number;
  };

  today: {
    hasItems: boolean;
    items: Workout[];
    missedItems: Workout[];
  };

  info: {
    tips: Tip[];
    progress: ProgressAchievements[];
    highlights: Highlights[];
  };

  goTo: (path: string) => void;
}

export type HighlightsItemsProps = {
  highlight: Highlights;
};
