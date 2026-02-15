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

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

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
  name: "",
  sets: 0,
  reps: 0,
});

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
  const { workoutById: workout } = useWorkoutById(editModalId);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

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
      hydratedForIdRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      hydratedForIdRef.current = null;
      setTitle("");
      setDate("");
      setTime("");
      setMuscleInput("");
      setSelectedMuscles([]);
      setTempSelected([]);
      setCustomMuscles([]);
      setExercises([createEmptyExercise()]);
      setErrors({});
      setShowToast(false);
      return;
    }

    if (!workout) return;
    if (hydratedForIdRef.current === workout.id) return;

    hydratedForIdRef.current = workout.id;

    setTitle(workout.title);
    setDate(toDateInput(workout.scheduledAt));
    setTime(toTimeInput(workout.scheduledAt));
    setSelectedMuscles(workout.muscleGroups ?? []);
    setTempSelected([]);
    setCustomMuscles([]);
    setExercises(
      workout.exercises.length
        ? workout.exercises.map((e) => ({ ...e }))
        : [createEmptyExercise()],
    );
    setErrors({});
    setShowToast(false);
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
    setExercises((prev) => [...prev, createEmptyExercise()]);

  const removeExercise = (id: string) =>
    setExercises((prev) => prev.filter((ex) => ex.id !== id));

  const updateExercise = (id: string, patch: Partial<ExerciseDTO>) =>
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)),
    );

  const validate = () => {
    const next: WorkoutCreateErrors = {};
    if (!title.trim()) next.title = "Training name is required";
    if (!date) next.date = "Date is required";
    if (!time) next.time = "Time is required";
    if (!exercises.some(isValidExercise))
      next.exercises = "Add at least one exercise";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const createOrUpdateWorkout = () => {
    if (!validate()) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    const existingIds =
      mode === "edit" && workout
        ? new Set(exercises.map((e) => e.id))
        : new Set<string>();

    const exercisesForPayload = exercises
      .filter(isValidExercise)
      .map((e) => ({
        ...e,
        id:
          mode === "edit" && workout && existingIds.has(e.id) ? e.id : EMPTY_GUID,
      }));

    const payload: Workout = {
      ...(workout ?? { id: crypto.randomUUID() }),
      title,
      muscleGroups: selectedMuscles,
      mainFocus: selectedMuscles[0],
      scheduledAt: mergeDateAndTime(date, time),
      completedAt: workout?.completedAt,
      exercises: exercisesForPayload,
    };

    if (mode === "create") createMutation.mutate(payload);
    else updateMutation.mutate(payload);

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
    updateExercise,

    errors,
    showToast,
    createOrUpdateWorkout,
  };
};
