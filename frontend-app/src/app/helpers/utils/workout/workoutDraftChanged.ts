import { DraftExercise, Exercise, ExerciseUpdate } from "@/types/workout/workout";

const toNumber = (v: string): number | undefined => {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export const toDraftExercise = (ex: Exercise): DraftExercise => ({
  id: ex.id,
  name: ex.name,
  sets: String(ex.sets),
  reps: String(ex.reps),
  weight: ex.weight?.toString() ?? "",
  restTimeSec: ex.restTimeSec?.toString() ?? "",
});

export const getExerciseUpdate = (
  original: Exercise,
  draft: DraftExercise
): ExerciseUpdate | null => {
  const patch: ExerciseUpdate = {};

  if (draft.name !== original.name) {
    patch.name = draft.name;
  }

  const sets = toNumber(draft.sets);
  if (sets !== original.sets) {
    patch.sets = sets;
  }

  const reps = toNumber(draft.reps);
  if (reps !== original.reps) {
    patch.reps = reps;
  }

  const weight = toNumber(draft.weight);
  if (weight !== original.weight) {
    patch.weight = weight;
  }

  const rest = toNumber(draft.restTimeSec);
  if (rest !== original.restTimeSec) {
    patch.restTimeSec = rest;
  }

  return Object.keys(patch).length > 0 ? patch : null;
};

export const numericOnly = (v: string) =>
  v.replace(/[^\d]/g, "");
