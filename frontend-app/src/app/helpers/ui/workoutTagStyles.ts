import { WorkoutStatus } from "@/types/workoutPage";

export const getWorkoutTagClass = (status: WorkoutStatus): string => {
  switch (status) {
    case "completed":
      return "bg-successGreen/20 text-successGreen";

    case "missed":
      return "bg-warningYellow/20 text-warningYellow";

    case "upcoming":
    default:
      return "bg-accent/15 text-accent";
  }
};
