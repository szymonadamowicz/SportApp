"use client";

import { useEffect, useState } from "react";
import { Workout, DraftExercise } from "@/types/workout/workout";
import {
  toDraftExercise,
  getExerciseUpdate,
} from "@/helpers/utils/workout/workoutDraftChanged";
import { useUpdateWorkout } from "@/hooks/apiHooks/useUpdateWorkout";
import { WorkoutFormVM } from "@/types/pages/workoutPage";

export const useWorkoutFormVM = (workout?: Workout | null): WorkoutFormVM => {
  const mutation = useUpdateWorkout();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Record<string, DraftExercise>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!workout) return;

    const initial: Record<string, DraftExercise> = {};
    workout.exercises.forEach((ex) => {
      initial[ex.id] = toDraftExercise(ex);
    });

    setDraft(initial);
    setEditMode(false);
    setHasChanges(false);
  }, [workout]);

  const updateDraft = (exerciseId: string, patch: Partial<DraftExercise>) => {
    setDraft((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], ...patch },
    }));
    setHasChanges(true);
  };

  const saveAllChanges = () => {
    if (!workout) return;

    workout.exercises.forEach((ex) => {
      const d = draft[ex.id];
      if (!d) return;

      const patch = getExerciseUpdate(ex, d);
      if (patch) {
        mutation.mutate({
          workoutId: workout.id,
          exerciseId: ex.id,
          patch,
        });
      }
    });

    setEditMode(false);
    setHasChanges(false);
  };

  const cancelEdit = () => {
    if (!workout) return;

    const reset: Record<string, DraftExercise> = {};
    workout.exercises.forEach((ex) => {
      reset[ex.id] = toDraftExercise(ex);
    });

    setDraft(reset);
    setEditMode(false);
    setHasChanges(false);
  };

  return {
    workout: workout ?? null,
    editMode,
    hasChanges,
    draft,
    enterEdit: () => setEditMode(true),
    cancelEdit,
    updateDraft,
    saveAllChanges,
  };
};
