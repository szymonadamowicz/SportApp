import { ProgressDTO } from "@/types/progress/progressDTO";

export const progressMock: ProgressDTO = {
  streak: {
    days: 4,
  },
  achievements: [
    {
      id: "total-workouts",
      title: "Total workouts",
      value: "128",
      context: "info",
    },  
    {
      id: "weekly-pr",
      title: "Weekly PRs",
      value: "2",
      valueWeek: "1",
      valueDiff: "+1",
      context: "pr",
      subLabel: "this week",
    },
  ],
};
