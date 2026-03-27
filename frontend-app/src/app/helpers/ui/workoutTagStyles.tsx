import { Clock, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { WorkoutListItemVM, WorkoutTagVM } from "@/types/pages/workoutPage";

export const getWorkoutTags = (workout: WorkoutListItemVM): WorkoutTagVM[] => {
  const tags: WorkoutTagVM[] = [];

  if (workout.timeLabel) {
    tags.push({
      id: "time",
      label: workout.timeLabel,
      icon: <Clock size={12} />,
      state: workout.status === "upcoming" ? "upcoming" : undefined,
    });
  }

  if (workout.dayLabel) {
    tags.push({
      id: "day",
      label: workout.dayLabel,
      icon: <Calendar size={12} />,
      state: "highlight",
    });
  }

  if (workout.status === "missed") {
    tags.push({
      id: "missed",
      label: "Missed",
      icon: <AlertTriangle size={12} />,
      state: "missed",
    });
  }

  if (workout.status === "completed") {
    tags.push({
      id: "completed",
      label: "Completed",
      icon: <CheckCircle2 size={12} />,
      state: "highlight",
    });
  }

  return tags;
};
