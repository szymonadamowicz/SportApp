import { HeroState } from "./workout";

export interface HeroProps {
  hero: HeroState;
  completedCount: number;
  upcomingCount: number;
  onPrimaryAction: () => void;
}

export interface HomePageVM {
  hero: HeroState;
  workouts: {
    completed: unknown[];
    upcoming: unknown[];
    allToday: unknown[];
  };
  info: {
    tipsForTheDay: unknown[];
    recentHighlightsData: unknown[];
    weeklyProgressData: unknown[];
  };
  goTo: (path: string) => void;
}
