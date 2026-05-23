export const workoutRunKeys = {
  all: ["workout-runs"] as const,
  latestActive: () => [...workoutRunKeys.all, "active"] as const,
  active: (workoutId: string) =>
    [...workoutRunKeys.all, "active", workoutId] as const,
};
