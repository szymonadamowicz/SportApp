"use client";

import { useEffect, useState } from "react";
import { Workout, DraftExercise, Exercise } from "@/types/workout/workout";
import {
  toDraftExercise,
  getExerciseUpdate,
} from "@/helpers/utils/workout/workoutDraftChanged";
import { DraftExerciseValidationError } from "@/types/workout/workout";
import { WorkoutFormVM } from "@/types/pages/workoutPage";
import { useUpdateWorkout } from "@/hooks/apiHooks/workouts/useUpdateWorkout";
import { useRouter } from "next/navigation";
import { validateDraftExercises } from "@/helpers/utils/workout/workoutDraftValidateExercise";

const createEmptyDraftExercise = (): DraftExercise => ({
  name: "",
  sets: "",
  reps: "",
  weight: "",
  restTimeSec: "",
});

export const useWorkoutFormVM = (workout?: Workout | null): WorkoutFormVM => {
  const mutation = useUpdateWorkout();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Record<string, DraftExercise>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [exerciseErrors, setExerciseErrors] = useState<
    Record<string, DraftExerciseValidationError>
  >({});

  const editWorkoutAction = () => {
    if (!workout?.id) return;
    router.replace(`?modal=open&edit=${workout.id}`);
  };

  useEffect(() => {
    if (!workout) return;

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

    setExerciseErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setHasChanges(true);
  };

  const saveAllChanges = () => {
    if (!workout) return;

    const validation = validateDraftExercises(draft);

    if (!validation.valid) {
      setExerciseErrors(validation.errors);
      return;
    }

    setExerciseErrors({});

    workout.exercises.forEach((ex) => {
      const d = draft[ex.id];
      if (!d) return;

      const patch = getExerciseUpdate(ex, d);
      if (patch) {
        mutation.mutate({
          kind: "exercise",
          workoutId: workout.id,
          exerciseId: ex.id,
          patch,
        });
      }
    });

    const newExercises: Exercise[] = Object.entries(draft)
      .filter(([id]) => !workout.exercises.some((e) => e.id === id))
      .map(([, d]) => ({
        id: crypto.randomUUID(),
        name: d.name.trim(),
        sets: Number(d.sets),
        reps: Number(d.reps),
        weight: d.weight ? Number(d.weight) : undefined,
        restTimeSec: d.restTimeSec ? Number(d.restTimeSec) : undefined,
      }));

    if (newExercises.length > 0) {
      mutation.mutate({
        kind: "createExercise",
        workoutId: workout.id,
        exercises: newExercises,
      });
    }

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
    setExerciseErrors({});
    setEditMode(false);
    setHasChanges(false);
  };

  return {
    workout: workout ?? null,
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
