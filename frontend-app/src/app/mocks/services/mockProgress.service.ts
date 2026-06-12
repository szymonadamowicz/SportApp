import { workoutsRepository } from "@/mocks/repositories/workouts.repository";
import { mockDelay } from "@/mocks/runtime/delay";
import { ProgressDto, ProgressScope } from "@/types/progress/progressDTO";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

const startOfWeekUtc = (now: Date): Date => {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const day = date.getUTCDay();
  const diff = (7 + (day - 1)) % 7;

  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);

  return date;
};

const parseUtcDate = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

const calculateStreak = (completedWorkouts: WorkoutDTO[]) => {
  const days = completedWorkouts
    .map((workout) => parseUtcDate(workout.completedAt))
    .filter((date): date is Date => Boolean(date))
    .map(
      (date) =>
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())),
    )
    .map((date) => date.toISOString().slice(0, 10))
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort()
    .reverse();

  if (days.length === 0) {
    return { current: 0, longest: 0, lastWorkoutDate: null as string | null };
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(`${todayIso}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayIso = yesterday.toISOString().slice(0, 10);

  let current = 0;
  if (days[0] === todayIso || days[0] === yesterdayIso) {
    current = 1;

    for (let i = 1; i < days.length; i++) {
      const previous = new Date(`${days[i - 1]}T00:00:00.000Z`);
      const expected = new Date(previous);
      expected.setUTCDate(expected.getUTCDate() - 1);

      const day = new Date(`${days[i]}T00:00:00.000Z`);

      if (day.getTime() === expected.getTime()) {
        current += 1;
      } else {
        break;
      }
    }
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const previous = new Date(`${days[i - 1]}T00:00:00.000Z`);
    const expected = new Date(previous);
    expected.setUTCDate(expected.getUTCDate() - 1);

    const day = new Date(`${days[i]}T00:00:00.000Z`);

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
    lastWorkoutDate: `${days[0]}T00:00:00.000Z`,
  };
};

const calculateStats = (workouts: WorkoutDTO[]) => {
  const completed = workouts.filter((workout) => Boolean(workout.completedAt));
  const exercises = completed.flatMap((workout) => workout.exercises ?? []);

  const totalReps = exercises.reduce(
    (accumulator, exercise) =>
      accumulator + (exercise.sets ?? 0) * (exercise.reps ?? 0),
    0,
  );

  const totalVolume = exercises.reduce((accumulator, exercise) => {
    const weight = exercise.weight ?? 0;
    return accumulator + (exercise.sets ?? 0) * (exercise.reps ?? 0) * weight;
  }, 0);

  const maxWeight =
    exercises.length === 0
      ? 0
      : Math.max(...exercises.map((exercise) => exercise.weight ?? 0));

  return {
    totalWorkouts: completed.length,
    totalReps,
    totalVolume,
    maxWeight,
  };
};

const calculatePrs = (workouts: WorkoutDTO[]) => {
  const completed = workouts.filter((workout) => Boolean(workout.completedAt));
  const maxByExercise = new Map<string, number>();

  for (const workout of completed) {
    for (const exercise of workout.exercises ?? []) {
      const previous = maxByExercise.get(exercise.name) ?? 0;
      const weight = exercise.weight ?? 0;
      if (weight > previous) maxByExercise.set(exercise.name, weight);
    }
  }

  return Array.from(maxByExercise.entries())
    .map(([exerciseName, maxWeight]) => ({ exerciseName, maxWeight }))
    .sort((a, b) => b.maxWeight - a.maxWeight);
};

export const mockProgressService = {
  async fetchProgress(scope: ProgressScope = "all"): Promise<ProgressDto> {
    await mockDelay(120);

    const workouts = workoutsRepository.list();
    const completed = workouts.filter((workout) => Boolean(workout.completedAt));

    const streak = calculateStreak(completed);

    const scoped =
      scope === "week"
        ? completed.filter((workout) => {
            const completedAt = parseUtcDate(workout.completedAt);
            if (!completedAt) return false;
            return completedAt.getTime() >= startOfWeekUtc(new Date()).getTime();
          })
        : completed;

    return {
      streak,
      stats: calculateStats(scoped),
      prs: calculatePrs(scoped),
    };
  },
};
