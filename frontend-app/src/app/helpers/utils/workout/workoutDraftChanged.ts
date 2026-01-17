import {
  DraftExercise,
  Exercise,
  ExerciseUpdate,
} from "@/types/workout/workout";

export const toDraftExercise = (ex: Exercise): DraftExercise => ({
  id: ex.id,
  name: ex.name,
  sets: (ex.sets),
  reps: (ex.reps),
  weight: ex.weight ?? 0,
  restTimeSec: ex.restTimeSec ?? 0,
});

export const getExerciseUpdate = (
  original: Exercise,
  draft: DraftExercise
): ExerciseUpdate | null => {
  const patch: ExerciseUpdate = {};

  if (draft.name !== original.name) patch.name = draft.name;

  const sets = (draft.sets);
  if (sets !== undefined && sets !== original.sets) patch.sets = sets;

  const reps = (draft.reps);
  if (reps !== undefined && reps !== original.reps) patch.reps = reps;

  const weight = (draft.weight);
  if (weight !== original.weight) patch.weight = weight;

  const rest = (draft.restTimeSec);
  if (rest !== original.restTimeSec) patch.restTimeSec = rest;

  return Object.keys(patch).length > 0 ? patch : null;
};

export const numericOnly = (v: string) => v.replace(/[^\d]/g, "");
