import { InfoPanelItem, Workout, Tip, Achievement, Highlights } from "@/types/workout/workout";

export const resolveInfoPanelItemType = (item: InfoPanelItem) => {
  if ("exercises" in item) return { type: "workout", item: item as Workout };
  if ("achievementTitle" in item) return { type: "achievement", item: item as Achievement };
  if ("highlightTitle" in item) return { type: "highlight", item: item as Highlights };
  return { type: "tip", item: item as Tip };
};
