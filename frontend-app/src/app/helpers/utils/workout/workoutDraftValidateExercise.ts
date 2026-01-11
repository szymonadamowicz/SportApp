import {
  DraftExercise,
  DraftExerciseValidationError,
  DraftExercisesValidationResult,
} from "@/types/workout/workout";

export const validateDraftExercises = (
  draft: Record<string, DraftExercise>
): DraftExercisesValidationResult => {
  const errors: Record<string, DraftExerciseValidationError> = {};

  Object.entries(draft).forEach(([id, d]) => {
    const err = validateDraftExercise(d);
    if (err) {
      errors[id] = err;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateDraftExercise = (
  d: DraftExercise
): DraftExerciseValidationError | null => {
  const errors: DraftExerciseValidationError = {};

  if (!d.name.trim()) errors.name = "Name is required";
  if (!d.sets || Number(d.sets) <= 0) errors.sets = "Sets must be > 0";
  if (!d.reps || Number(d.reps) <= 0) errors.reps = "Reps must be > 0";

  return Object.keys(errors).length ? errors : null;
};
