import { ProgressDto, ProgressScope } from "@/types/progress/progressDTO";
import { workoutsMockDb } from "../workouts/workouts.mockDb";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const startOfWeekUtc = (now: Date): Date => {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const day = d.getUTCDay();
  const diff = (7 + (day - 1)) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const parseUtcDate = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const calculateStreak = (completedWorkouts: WorkoutDTO[]) => {
  const days = completedWorkouts
    .map((w) => parseUtcDate(w.completedAt)!)
    .filter(Boolean)
    .map(
      (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
    )
    .map((d) => d.toISOString().slice(0, 10))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort()
    .reverse();

  if (days.length === 0) {
    return { current: 0, longest: 0, lastWorkoutDate: null as string | null };
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  if (days[0] !== todayIso) {
    return {
      current: 0,
      longest: 0,
      lastWorkoutDate: days[0] + "T00:00:00.000Z",
    };
  }

  let current = 1;
  let longest = 1;

  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00.000Z");
    const expected = new Date(prev);
    expected.setUTCDate(expected.getUTCDate() - 1);

    const day = new Date(days[i] + "T00:00:00.000Z");

    if (day.getTime() === expected.getTime()) {
      current += 1;
    } else {
      break;
    }
  }

  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00.000Z");
    const expected = new Date(prev);
    expected.setUTCDate(expected.getUTCDate() - 1);

    const day = new Date(days[i] + "T00:00:00.000Z");

    if (day.getTime() === expected.getTime()) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return {
    current,
    longest,
    lastWorkoutDate: days[0] + "T00:00:00.000Z",
  };
};

const calculateStats = (workouts: WorkoutDTO[]) => {
  const completed = workouts.filter((w) => Boolean(w.completedAt));
  const exercises = completed.flatMap((w) => w.exercises ?? []);

  const totalReps = exercises.reduce(
    (acc, e) => acc + (e.sets ?? 0) * (e.reps ?? 0),
    0,
  );

  const totalVolume = exercises.reduce((acc, e) => {
    const weight = e.weight ?? 0;
    return acc + (e.sets ?? 0) * (e.reps ?? 0) * weight;
  }, 0);

  const maxWeight =
    exercises.length === 0 ? 0 : Math.max(...exercises.map((e) => e.weight ?? 0));

  return {
    totalWorkouts: completed.length,
    totalReps,
    totalVolume,
    maxWeight,
  };
};

const calculatePrs = (workouts: WorkoutDTO[]) => {
  const completed = workouts.filter((w) => Boolean(w.completedAt));
  const map = new Map<string, number>();

  for (const w of completed) {
    for (const e of w.exercises ?? []) {
      const prev = map.get(e.name) ?? 0;
      const weight = e.weight ?? 0;
      if (weight > prev) map.set(e.name, weight);
    }
  }

  return Array.from(map.entries())
    .map(([exerciseName, maxWeight]) => ({ exerciseName, maxWeight }))
    .sort((a, b) => b.maxWeight - a.maxWeight);
};

export const progressMockDb = {
  async fetch(scope: ProgressScope = "all"): Promise<ProgressDto> {
    await delay(120);

    const workouts = await workoutsMockDb.fetchAll();
    const completed = workouts.filter((w) => Boolean(w.completedAt));

    const streak = calculateStreak(completed);

    const scoped =
      scope === "week"
        ? completed.filter((w) => {
            const d = parseUtcDate(w.completedAt);
            if (!d) return false;
            return d.getTime() >= startOfWeekUtc(new Date()).getTime();
          })
        : completed;

    return {
      streak,
      stats: calculateStats(scoped),
      prs: calculatePrs(scoped),
    };
  },
};
