import { getHeroState } from "@/helpers/utils/workoutHero";
import { useNow } from "@/hooks/useNow";
import { Workout } from "@/types/workout";

export const useHeroVM = (workouts: Workout[]) => {
  const baseNow = useNow(60_000);
  const baseHero = getHeroState(workouts, baseNow);

  const isUrgent =
    baseHero.kind === "upcoming" &&
    baseHero.workout &&
    baseHero.workout.scheduledAt.getTime() - baseNow.getTime() < 60_000;

  const now = useNow(isUrgent ? 1_000 : 60_000);

  return getHeroState(workouts, now);
};
