import { Workout, HeroState } from "@/types/workout";
import { formatTimeDiff, isSameDay } from "./workoutTime";
import { useNow } from "@/hooks/useNow";

const isInMissedWindow = (missedAt: Date, nextWorkoutAt: Date, now: Date) => {
  const gapMs = nextWorkoutAt.getTime() - missedAt.getTime();
  const missedWindowMs = gapMs / 3;

  return now.getTime() - missedAt.getTime() <= missedWindowMs;
};

export const getHeroState = (workouts: Workout[], now: Date): HeroState => {
  const today = workouts.filter((w) => isSameDay(w.scheduledAt, now));

  const notCompleted = today.filter((w) => !w.completedAt);

  const sorted = [...notCompleted].sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()
  );

  const next = sorted.find((w) => w.scheduledAt > now);
  const missed = sorted.find((w) => w.scheduledAt <= now);

  if (next && !missed) {
    return {
      kind: "upcoming",
      title: next.title,
      subtitle: next.muscleGroup,
      timeLabel: `Starts in ${formatTimeDiff(next.scheduledAt, now)}`,
      workout: next,
    };
  }

  if (missed) {
    if (next) {
      const stillMissed = isInMissedWindow(
        missed.scheduledAt,
        next.scheduledAt,
        now
      );

      if (stillMissed) {
        return {
          kind: "missed",
          title: missed.title,
          subtitle: `Missed at ${missed.scheduledAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          workout: missed,
        };
      }

      return {
        kind: "upcoming",
        title: next.title,
        subtitle: next.muscleGroup,
        timeLabel: `Starts in ${formatTimeDiff(next.scheduledAt, now)}`,
        workout: next,
      };
    }

    return {
      kind: "missed",
      title: missed.title,
      subtitle: "Missed earlier today",
      workout: missed,
    };
  }

  return {
    kind: "rest",
    title: "Done for today",
    subtitle: "All trainings completed",
  };
};

export const useHeroState = (workouts: Workout[]) => {
  const baseNow = useNow(60_000);
  const baseHero = getHeroState(workouts, baseNow);

  const isLastMinute =
    baseHero.kind === "upcoming" &&
    baseHero.workout &&
    baseHero.workout.scheduledAt.getTime() - baseNow.getTime() < 60_000;

  const now = useNow(isLastMinute ? 1_000 : 60_000);

  return getHeroState(workouts, now);
};
