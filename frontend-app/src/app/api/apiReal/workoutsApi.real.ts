import { WorkoutDTO } from "@/types/workout/workoutDTO";

export const fetchWorkoutsApi = async (): Promise<WorkoutDTO[]> => {
  const res = await fetch("/api/workouts");

  if (!res.ok) {
    throw new Error("Failed to fetch workouts");
  }

  return res.json();
};
