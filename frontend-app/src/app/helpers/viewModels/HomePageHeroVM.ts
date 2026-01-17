import { Workout } from "@/types/workout/workout";
import { getHeroState } from "../utils/components/workoutHero";
import { useNow } from "@/hooks/helperHooks/useNow";

export const useHeroVM = (workouts: Workout[]) => {
  const minuteNow = useNow(60_000);
  const baseHero = getHeroState(workouts, minuteNow);

  const isUrgent =
    baseHero.kind === "upcoming" &&
    baseHero.workout &&
    baseHero.workout.scheduledAt.getTime() - minuteNow.getTime() < 60_000;

  const now = useNow(isUrgent ? 1_000 : 60_000);

  return getHeroState(workouts, now);
};
