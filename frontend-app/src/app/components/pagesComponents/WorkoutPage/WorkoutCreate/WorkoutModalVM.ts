"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  WorkoutCreateErrors,
  WorkoutModalVM,
  useWorkoutModalVMProps,
} from "@/types/pages/workoutPage";
import { ExerciseDTO } from "@/types/workout/workoutDTO";
import { useCreateWorkout } from "@/hooks/apiHooks/workouts/useCreateWorkout";
import { useWorkoutById } from "@/hooks/apiHooks/workouts/useWorkoutById";
import { Workout } from "@/types/workout/workout";
import { isValidExercise } from "@/helpers/utils/workout/workoutDraftValidateExercise";
import { usePutWorkoutStructure } from "@/hooks/apiHooks/workouts/usePutWorkoutStructure";
import { usePatchWorkoutMeta } from "@/hooks/apiHooks/workouts/usePatchWorkoutMeta";

const PRESET_MUSCLE_GROUPS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full body",
  "calves",
  "glutes",
  "traps",
  "forearms",
];

const createEmptyExercise = (): ExerciseDTO => ({
  id: crypto.randomUUID(),
  orderIndex: 0,
  name: "",
  sets: 0,
  reps: 0,
});

const getExerciseFieldErrors = (exercise: ExerciseDTO) => {
  const fieldErrors: { name?: string; sets?: string; reps?: string } = {};

  if (!exercise.name.trim()) {
    fieldErrors.name = "Name is required";
  }

  if (!exercise.sets || exercise.sets <= 0) {
    fieldErrors.sets = "Sets must be > 0";
  }

  if (!exercise.reps || exercise.reps <= 0) {
    fieldErrors.reps = "Reps must be > 0";
  }

  return fieldErrors;
};

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);
const toTimeInput = (d: Date) =>
  `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

const mergeDateAndTime = (date: string, time: string) => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

export const useWorkoutModalVM = ({
  editModalId,
  onClose,
  open,
}: useWorkoutModalVMProps): WorkoutModalVM => {
  const mode: "create" | "edit" = editModalId ? "edit" : "create";

  const createMutation = useCreateWorkout();
  const updateMutation = usePutWorkoutStructure();
  const patchMetaMutation = usePatchWorkoutMeta();
  const { workoutById: workout } = useWorkoutById(editModalId);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isCompleted, setIsCompletedState] = useState(false);
  const [completedDate, setCompletedDateState] = useState("");
  const [completedTime, setCompletedTimeState] = useState("");

  const [muscleInput, setMuscleInput] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [customMuscles, setCustomMuscles] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [exercises, setExercises] = useState<ExerciseDTO[]>([
    createEmptyExercise(),
  ]);

  const [errors, setErrors] = useState<WorkoutCreateErrors>({});
  const [showToast, setShowToast] = useState(false);

  const hydratedForIdRef = useRef<string | null>(null);

  const resetFormState = () => {
    hydratedForIdRef.current = null;
    setTitle("");
    setDate("");
    setTime("");
    setIsCompletedState(false);
    setCompletedDateState("");
    setCompletedTimeState("");
    setMuscleInput("");
    setSelectedMuscles([]);
    setTempSelected([]);
    setCustomMuscles([]);
    setExercises([createEmptyExercise()]);
    setErrors({});
    setShowToast(false);
    setDropdownOpen(false);
  };

  const hydrateEditForm = (source: Workout) => {
    hydratedForIdRef.current = source.id;

    setTitle(source.title);
    setDate(toDateInput(source.scheduledAt));
    setTime(toTimeInput(source.scheduledAt));
    setIsCompletedState(Boolean(source.completedAt));
    setCompletedDateState(
      source.completedAt ? toDateInput(source.completedAt) : "",
    );
    setCompletedTimeState(
      source.completedAt ? toTimeInput(source.completedAt) : "",
    );
    setSelectedMuscles(source.muscleGroups ?? []);
    setTempSelected([]);
    setCustomMuscles([]);
    setExercises(
      source.exercises.length
        ? [...source.exercises]
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            .map((exercise, orderIndex) => ({
              ...exercise,
              orderIndex: exercise.orderIndex ?? orderIndex,
            }))
        : [createEmptyExercise()],
    );
    setErrors({});
    setShowToast(false);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.contains(e.target as Node)) return;
      setDropdownOpen(false);
      setTempSelected([]);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) {
      resetFormState();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      resetFormState();
      return;
    }

    if (!workout) return;
    if (hydratedForIdRef.current === workout.id) return;

    hydrateEditForm(workout);
  }, [open, mode, workout]);

  const dropdownItems = useMemo(() => {
    const query = muscleInput.toLowerCase();

    const custom = customMuscles.filter(
      (m) => m.includes(query) && !selectedMuscles.includes(m),
    );

    const preset = PRESET_MUSCLE_GROUPS.filter(
      (m) => m.includes(query) && !selectedMuscles.includes(m),
    );

    return [...custom, ...preset];
  }, [muscleInput, selectedMuscles, customMuscles]);

  const toggleTemp = (m: string) => {
    setTempSelected((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const addCustomMuscle = () => {
    const value = muscleInput.trim().toLowerCase();
    if (!value) return;
    if (
      PRESET_MUSCLE_GROUPS.includes(value) ||
      customMuscles.includes(value) ||
      selectedMuscles.includes(value)
    ) {
      setMuscleInput("");
      return;
    }

    setCustomMuscles((prev) => [...prev, value]);
    setTempSelected((prev) => [...prev, value]);
    setMuscleInput("");
  };

  const confirmAddMuscles = () => {
    setSelectedMuscles((prev) => [...prev, ...tempSelected]);
    setTempSelected([]);
    setDropdownOpen(false);
  };

  const removeMuscle = (m: string) => {
    setSelectedMuscles((prev) => prev.filter((x) => x !== m));
  };

  const addExercise = () =>
    setExercises((prev) => {
      const nextOrderIndex =
        prev.reduce(
          (max, exercise) => Math.max(max, exercise.orderIndex ?? -1),
          -1,
        ) + 1;

      return [
        ...prev,
        {
          ...createEmptyExercise(),
          orderIndex: nextOrderIndex,
        },
      ];
    });

  const removeExercise = (id: string) => {
    setExercises((prev) => {
      return prev.filter((ex) => ex.id !== id);
    });

    setErrors((prev) => {
      if (!prev.exerciseFields?.[id]) return prev;

      const nextFields = { ...prev.exerciseFields };
      delete nextFields[id];

      return {
        ...prev,
        exerciseFields:
          Object.keys(nextFields).length > 0 ? nextFields : undefined,
      };
    });
  };

  const updateExercise = (id: string, patch: Partial<ExerciseDTO>) =>
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)),
    );

  const clearExerciseError = (id: string) => {
    setErrors((prev) => {
      if (!prev.exerciseFields?.[id]) return prev;

      const nextFields = { ...prev.exerciseFields };
      delete nextFields[id];

      return {
        ...prev,
        exerciseFields:
          Object.keys(nextFields).length > 0 ? nextFields : undefined,
        exercises: undefined,
      };
    });
  };

  const updateExerciseAndClearErrors = (
    id: string,
    patch: Partial<ExerciseDTO>,
  ) => {
    updateExercise(id, patch);
    clearExerciseError(id);
  };

  const setIsCompleted = (value: boolean) => {
    setIsCompletedState(value);
    setErrors((prev) => ({
      ...prev,
      completedDate: undefined,
      completedTime: undefined,
    }));

    if (!value) {
      setCompletedDateState("");
      setCompletedTimeState("");
    }
  };

  const setCompletedDate = (value: string) => {
    setCompletedDateState(value);
    setErrors((prev) => ({ ...prev, completedDate: undefined }));
  };

  const setCompletedTime = (value: string) => {
    setCompletedTimeState(value);
    setErrors((prev) => ({ ...prev, completedTime: undefined }));
  };

  const validate = () => {
    const next: WorkoutCreateErrors = {};
    const exerciseFields: NonNullable<WorkoutCreateErrors["exerciseFields"]> =
      {};

    if (!title.trim()) next.title = "Training name is required";
    if (!date) next.date = "Date is required";
    if (!time) next.time = "Time is required";

    if (isCompleted && !completedDate) {
      next.completedDate = "Completion date is required";
    }

    if (isCompleted && !completedTime) {
      next.completedTime = "Completion time is required";
    }

    if (isCompleted && date && time && completedDate && completedTime) {
      const scheduledAt = mergeDateAndTime(date, time);
      const completedAt = mergeDateAndTime(completedDate, completedTime);

      if (completedAt.getTime() < scheduledAt.getTime()) {
        next.completedTime = "Completion cannot be earlier than scheduled time";
      }
    }

    exercises.forEach((exercise) => {
      const fieldErrors = getExerciseFieldErrors(exercise);
      if (Object.keys(fieldErrors).length > 0) {
        exerciseFields[exercise.id] = fieldErrors;
      }
    });

    const hasAnyValidExercise = exercises.some(isValidExercise);

    if (Object.keys(exerciseFields).length > 0) {
      next.exerciseFields = exerciseFields;
      next.exercises =
        "Complete required fields (name, sets, reps) or remove incomplete exercises.";
    } else if (!hasAnyValidExercise) {
      next.exercises = "Add at least one exercise";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const createOrUpdateWorkout = async () => {
    if (!validate()) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    const normalizedExercisesForPayload = exercises
      .map((exercise, orderIndex) => ({
        ...exercise,
        orderIndex,
      }))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const completedAt =
      isCompleted && completedDate && completedTime
        ? mergeDateAndTime(completedDate, completedTime)
        : undefined;

    const payload: Workout = {
      ...(workout ?? { id: crypto.randomUUID() }),
      title,
      muscleGroups: selectedMuscles,
      mainFocus: selectedMuscles[0],
      scheduledAt: mergeDateAndTime(date, time),
      completedAt,
      exercises: normalizedExercisesForPayload,
    };

    if (mode === "create") {
      createMutation.mutate(payload);
      onClose();
      return;
    }

    await updateMutation.mutateAsync(payload);

    await patchMetaMutation.mutateAsync(payload);

    onClose();
  };

  return {
    mode,
    title,
    setTitle,
    date,
    setDate,
    time,
    setTime,
    isCompleted,
    setIsCompleted,
    completedDate,
    setCompletedDate,
    completedTime,
    setCompletedTime,

    muscleInput,
    setMuscleInput,
    selectedMuscles,
    tempSelected,
    dropdownItems,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    toggleTemp,
    addCustomMuscle,
    confirmAddMuscles,
    removeMuscle,

    exercises,
    addExercise,
    removeExercise,
    updateExercise: updateExerciseAndClearErrors,

    errors,
    showToast,
    createOrUpdateWorkout,
  };
};
