"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DraftExercise,
  DraftExerciseValidationError,
  Exercise,
  Workout,
} from "@/types/workout/workout";
import { WorkoutFormVM } from "@/types/pages/workoutPage";
import { useUpdateWorkout } from "@/hooks/apiHooks/workouts/useUpdateWorkout";
import { toDraftExercise } from "@/helpers/utils/workout/workoutDraftChanged";
import { validateDraftExercises } from "@/helpers/utils/workout/workoutDraftValidateExercise";
import { useNow } from "@/hooks/helperHooks/useNow";

const createEmptyDraftExercise = (): DraftExercise => ({
  name: "",
  sets: 0,
  reps: 0,
  weight: undefined,
  restTimeSec: undefined,
});

const toNumberOrUndefined = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const useWorkoutFormVM = (
  workout: Workout,
  setEditWorkoutId: (id: string) => void,
): WorkoutFormVM => {
  const mutation = useUpdateWorkout();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Record<string, DraftExercise>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [exerciseErrors, setExerciseErrors] = useState<
    Record<string, DraftExerciseValidationError>
  >({});

  const now = useNow();

  const editWorkoutAction = () => setEditWorkoutId(workout.id);

  useEffect(() => {
    const initial: Record<string, DraftExercise> = {};
    workout.exercises.forEach((ex) => {
      initial[ex.id] = toDraftExercise(ex);
    });

    setDraft(initial);
    setExerciseErrors({});
    setEditMode(false);
    setHasChanges(false);
  }, [workout]);

  const enterEdit = () => setEditMode(true);
  const enterExercisesEdit = () => setEditMode(true);

  const updateDraft = (id: string, patch: Partial<DraftExercise>) => {
    setDraft((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? createEmptyDraftExercise()), ...patch },
    }));

    setExerciseErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setHasChanges(true);
  };


  const addExercise = () => {
    const id = crypto.randomUUID();
    setDraft((prev) => ({ ...prev, [id]: createEmptyDraftExercise() }));
    setHasChanges(true);
  };

  const removeExercise = (id: string) => {
    setDraft((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setHasChanges(true);
  };

  const computedExercises = useMemo<Exercise[]>(() => {
    return Object.entries(draft).map(([id, d]) => ({
      id,
      name: d.name.trim(),
      sets: Number(d.sets),
      reps: Number(d.reps),
      weight: toNumberOrUndefined(d.weight),
      restTimeSec: toNumberOrUndefined(d.restTimeSec),
    }));
  }, [draft]);

  const saveAllChanges = () => {
    const validation = validateDraftExercises(draft);
    if (!validation.valid) {
      setExerciseErrors(validation.errors);
      return;
    }

    const nextWorkout: Workout = {
      ...workout,
      exercises: computedExercises,
    };

    mutation.mutate(nextWorkout);
    setEditMode(false);
    setHasChanges(false);
  };

  const cancelEdit = () => {
    const reset: Record<string, DraftExercise> = {};
    workout.exercises.forEach((ex) => {
      reset[ex.id] = toDraftExercise(ex);
    });

    setDraft(reset);
    setExerciseErrors({});
    setEditMode(false);
    setHasChanges(false);
  };

  return {
    now,
    workout,
    editMode,
    hasChanges,
    draft,
    exerciseErrors,

    enterEdit,
    enterExercisesEdit,

    cancelEdit,
    updateDraft,
    addExercise,
    removeExercise,
    saveAllChanges,
    editWorkoutAction,
  };
};
