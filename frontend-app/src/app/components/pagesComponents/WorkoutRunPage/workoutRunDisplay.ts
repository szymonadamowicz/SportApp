import { WorkoutRunPhase } from "@/types/pages/workoutRunPage";

export const metricCardClass =
  "rounded-lg border border-borderSoft bg-bgHighlight/30 px-3 py-2";

export const formatClock = (seconds: number): string => {
  const prefix = seconds < 0 ? "+" : "";
  const safeSeconds = Math.abs(seconds);
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${prefix}${mins}:${secs}`;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins <= 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

export const formatWeight = (weight?: number | null): string => {
  if (!weight || weight <= 0) return "bodyweight";
  return `${Number(weight.toFixed(1)).toLocaleString()} kg`;
};

export const getPhaseColor = (phase: WorkoutRunPhase): string => {
  if (phase === "exercise") return "#34d399";
  if (phase === "rest") return "#38bdf8";
  return "#f59e0b";
};

export const getPhaseLabel = (phase: WorkoutRunPhase): string => {
  if (phase === "exercise") return "Set estimate";
  if (phase === "rest") return "Rest timer";
  return "Session summary";
};
