import {
  progressAchievementsSeed,
  progressStreakSeed,
  progressWeeklyCompletionSeed,
} from "./progress.seed";
import { ProgressDTO } from "@/types/progress/progressDTO";

const db: ProgressDTO = {
  achievements: [...progressAchievementsSeed],
  weeklyCompletion: { ...progressWeeklyCompletionSeed },
  streak: { ...progressStreakSeed },
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const progressMockDb = {
  async fetchAll(): Promise<ProgressDTO> {
    await delay(150);
    return {
      achievements: [...db.achievements],
      weeklyCompletion: { ...db.weeklyCompletion },
      streak: { ...db.streak },
    };
  },
};
