import { ProgressAchievements } from "@/types/progress/progress";

export const getSelectedAchievementsProgress = (
  progress: ProgressAchievements[]
): ProgressAchievements[] => {
  const selected: ProgressAchievements[] = [];

  for (let i = 0; i < (progress.length < 3 ? progress.length : 3); i++) {
    const randomIndex = Math.floor(Math.random() * progress.length);
    selected.push(progress[randomIndex]);
  }

  return selected;
};

export const getInfoAchievementProgressItems = (
  progressAchievements: ProgressAchievements[]
): ProgressAchievements[] => {
  return progressAchievements.filter((p) => p.context == "info");
};

export const getPRAchievementProgressItems = (
  progressAchievements: ProgressAchievements[]
): ProgressAchievements[] => {
  return progressAchievements.filter((p) => p.context == "pr");
};
