import { WorkoutStatus } from "@/types/pages/workoutPage";

export const getStatusTagClass = (status: WorkoutStatus): string => {
  switch (status) {
    case "completed":
      return [
        "bg-emerald-500/10",
        "text-emerald-300",
        "border-emerald-400/30",
      ].join(" ");

    case "missed":
      return ["bg-amber-400/15", "text-amber-300", "border-amber-400/40"].join(
        " "
      );

    case "upcoming":
    default:
      return ["bg-sky-500/10", "text-sky-300", "border-sky-400/30"].join(" ");
  }
};

export const dateTagClass =
  "bg-slate-500/10 text-slate-300 border-slate-400/30";

  