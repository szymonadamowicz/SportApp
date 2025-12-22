import { Tips, WeeklyProgress, RecentHighlights  } from "@/mocks/WorkoutsPageMocks";
import { Achievement, Tip, Highlights } from "@/types/types";

export const useInfoData = () => {
  const tipsForTheDay: Tip[] = Tips;

  const weeklyProgressData: Achievement[] = WeeklyProgress;

  const recentHighlightsData: Highlights[] = RecentHighlights;

  return { tipsForTheDay, weeklyProgressData, recentHighlightsData };
};
