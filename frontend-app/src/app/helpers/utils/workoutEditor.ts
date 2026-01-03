import { DraftExercise, Exercise, ExerciseUpdate } from "@/types/workout";

export const toDraftExercise = (ex: Exercise): DraftExercise => ({
  id: ex.id,
  name: ex.name,
  sets: String(ex.sets),
  reps: String(ex.reps),
  weight: ex.weight?.toString() ?? "",
  restTimeSec: ex.restTimeSec?.toString() ?? "",
  muscleGroups: (ex.muscleGroups ?? []).join(", "),
});

const toInt = (v: string, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
};

const toOptionalNumber = (v: string): number | undefined => {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const parseMuscleGroups = (v: string): string[] =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const getExerciseUpdate = (
  original: Exercise,
  draft: DraftExercise
): ExerciseUpdate | null => {
  const patch: ExerciseUpdate = {};

  const sets = toInt(draft.sets, original.sets);
  if (sets !== original.sets) patch.sets = sets;

  const reps = toInt(draft.reps, original.reps);
  if (reps !== original.reps) patch.reps = reps;

  const weight = toOptionalNumber(draft.weight);
  if (weight !== original.weight) patch.weight = weight;

  const rest = toOptionalNumber(draft.restTimeSec);
  if (rest !== original.restTimeSec) patch.restTimeSec = rest;

  const muscles = parseMuscleGroups(draft.muscleGroups);
  if (JSON.stringify(muscles) !== JSON.stringify(original.muscleGroups ?? [])) {
    patch.muscleGroups = muscles;
  }

  return Object.keys(patch).length ? patch : null;
};

export const numericOnly = (v: string) =>
  v.replace(/[^\d]/g, "");
