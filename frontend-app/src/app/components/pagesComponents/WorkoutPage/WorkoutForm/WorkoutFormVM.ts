"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DraftExercise,
  DraftExerciseValidationError,
  Exercise,
  Workout,
} from "@/types/workout/workout";
import { WorkoutFormVM } from "@/types/pages/workoutPage";
import { toDraftExercise } from "@/helpers/utils/workout/workoutDraftChanged";
import { validateDraftExercises } from "@/helpers/utils/workout/workoutDraftValidateExercise";
import { useNow } from "@/hooks/helperHooks/useNow";
import {
  openEditWorkout,
  openWorkoutRun,
} from "@/helpers/utils/navigation/workoutRoutes";
import { useRouter } from "next/navigation";
import { usePutWorkoutStructure } from "@/hooks/apiHooks/workouts/usePutWorkoutStructure";
import { useActiveWorkoutRun } from "@/hooks/apiHooks/workoutRun/useActiveWorkoutRun";
import { getFriendlyErrorMessage } from "@/api/apiError";
import { createClientId } from "@/helpers/utils/id/createClientId";

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

export const useWorkoutFormVM = (workout: Workout): WorkoutFormVM => {
  const mutation = usePutWorkoutStructure();
  const { activeRun } = useActiveWorkoutRun(workout.id);

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Record<string, DraftExercise>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [exerciseErrors, setExerciseErrors] = useState<
    Record<string, DraftExerciseValidationError>
  >({});
  const [actionError, setActionError] = useState<string | null>(null);

  const now = useNow();
  const router = useRouter();

  const handleEditWorkout = () => {
    openEditWorkout(router, workout.id);
  };

  const handleStartWorkout = () => {
    openWorkoutRun(router, workout.id);
  };

  useEffect(() => {
    const initial: Record<string, DraftExercise> = {};
    workout.exercises.forEach((ex) => {
      initial[ex.id] = toDraftExercise(ex);
    });

    setDraft(initial);
    setExerciseErrors({});
    setActionError(null);
    setEditMode(false);
    setHasChanges(false);
  }, [workout]);

  const enterExercisesEdit = () => setEditMode(true);

  const updateDraft = (id: string, patch: Partial<DraftExercise>) => {
    setActionError(null);
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
    const clientId = createClientId();
    setDraft((prev) => ({ ...prev, [clientId]: createEmptyDraftExercise() }));
    setHasChanges(true);
  };

  const removeExercise = (id: string) => {
    setDraft((prev) => {
      const filteredEntries = Object.entries(prev).filter(
        ([key]) => key !== id,
      );

      if (filteredEntries.length === 0) {
        return prev;
      }

      return Object.fromEntries(filteredEntries);
    });
    setHasChanges(true);
  };

  const computedExercises = useMemo<Exercise[]>(() => {
    return Object.entries(draft)
      .map(([key, d]) => ({
        id: key,
        orderIndex: d.orderIndex,
        name: d.name.trim(),
        sets: Number(d.sets),
        reps: Number(d.reps),
        weight: toNumberOrUndefined(d.weight),
        restTimeSec: toNumberOrUndefined(d.restTimeSec),
      }))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [draft]);

  const saveAllChanges = async () => {
    const validation = validateDraftExercises(draft);
    if (!validation.valid) {
      setExerciseErrors(validation.errors);
      setActionError("Fix the highlighted exercise fields before saving.");
      return;
    }

    const nextWorkout: Workout = {
      ...workout,
      exercises: computedExercises,
    };

    setActionError(null);

    try {
      await mutation.mutateAsync(nextWorkout);
      setEditMode(false);
      setHasChanges(false);
    } catch (error) {
      setActionError(
        getFriendlyErrorMessage(
          error,
          "Could not save exercise changes. Please try again.",
        ),
      );
    }
  };

  const cancelEdit = () => {
    const reset: Record<string, DraftExercise> = {};
    workout.exercises.forEach((ex) => {
      reset[ex.id] = toDraftExercise(ex);
    });

    setDraft(reset);
    setExerciseErrors({});
    setActionError(null);
    setEditMode(false);
    setHasChanges(false);
  };

  const startButtonLabel = activeRun ? "Continue workout" : "Start workout";

  return {
    now,
    workout: {
      ...workout,
      exercises: computedExercises,
    },
    editMode,
    hasChanges,
    draft,
    exerciseErrors,
    actionError,
    isSaving: mutation.isPending,
    handleEditWorkout,
    handleStartWorkout,
    startButtonLabel,
    enterExercisesEdit,

    cancelEdit,
    updateDraft,
    addExercise,
    removeExercise,
    saveAllChanges,
  };
};
