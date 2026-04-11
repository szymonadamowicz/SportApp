import { ProgressAchievements } from "@/types/progress/progress";
import { WorkoutRunStart } from "../workout/workoutRun";
import { HeroState, Highlights, Tip, Workout } from "../workout/workout";

export interface HeroProps {
  hero: HeroState;
  activeRun?: WorkoutRunStart | null;
  activeElapsedSeconds?: number;
  completedCount: number;
  upcomingCount: number;
  onPrimaryAction: () => void;
}

export interface HomePageVM {
  hero: HeroState;
  activeRun: WorkoutRunStart | null;
  activeElapsedSeconds: number;
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
  isLoading: boolean;
}

export type HighlightsItemsProps = {
  highlight: Highlights;
};
