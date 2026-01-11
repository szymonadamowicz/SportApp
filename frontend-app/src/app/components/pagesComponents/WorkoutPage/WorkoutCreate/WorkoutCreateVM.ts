"use client";

import { useCreateWorkout } from "@/hooks/apiHooks/workouts/useCreateWorkout";
import { useEffect, useRef, useState } from "react";
import { WorkoutDTO, ExerciseDTO } from "@/types/workout/workoutDTO";
import { WorkoutCreateErrors } from "@/types/pages/workoutPage";
import { useWorkoutById } from "@/hooks/apiHooks/workouts/useWorkoutById";
import { useRouter } from "next/navigation";

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

export const useCreateWorkoutVM = (editModalId?: string) => {
  const isEditMode = Boolean(editModalId);
  const { workoutById: workout } = useWorkoutById(editModalId);

  const router = useRouter();

  const mutation = useCreateWorkout();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  const [muscleInput, setMuscleInput] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [exercises, setExercises] = useState<ExerciseDTO[]>([
    createEmptyExercise(),
  ]);

  const [errors, setErrors] = useState<WorkoutCreateErrors>({});
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!workout || !isEditMode) return;

    setTitle(workout.title);

    const d = new Date(workout.scheduledAt);
    setDate(d.toISOString().slice(0, 10));
    setTime(d.toISOString().slice(11, 16));

    setSelectedMuscles(workout.muscleGroups ?? []);
    setExercises(
      workout.exercises.length > 0 ? workout.exercises : [createEmptyExercise()]
    );
  }, [workout, isEditMode]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setTempSelected([]);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filteredMuscles = PRESET_MUSCLE_GROUPS.filter(
    (m) => m.includes(muscleInput.toLowerCase()) && !selectedMuscles.includes(m)
  );

  const toggleTemp = (m: string) => {
    setTempSelected((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const confirmAddMuscles = () => {
    const custom =
      muscleInput && !PRESET_MUSCLE_GROUPS.includes(muscleInput.toLowerCase())
        ? [muscleInput.toLowerCase()]
        : [];

    setSelectedMuscles((prev) => [...prev, ...tempSelected, ...custom]);
    setTempSelected([]);
    setMuscleInput("");
    setDropdownOpen(false);
  };

  const removeMuscle = (m: string) => {
    setSelectedMuscles((prev) => prev.filter((x) => x !== m));
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, createEmptyExercise()]);
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id: string, patch: Partial<ExerciseDTO>) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex))
    );

    setErrors((prev) => ({
      ...prev,
      exerciseFields: {
        ...prev.exerciseFields,
        [id]: {},
      },
    }));
  };

  const validate = (): boolean => {
    const nextErrors: WorkoutCreateErrors = {};
    let valid = true;

    if (!title.trim()) {
      nextErrors.title = "Training name is required";
      valid = false;
    }

    if (!date) {
      nextErrors.date = "Date is required";
      valid = false;
    }

    if (!time) {
      nextErrors.time = "Time is required";
      valid = false;
    }

    if (!isEditMode) {
      if (exercises.length === 0) {
        nextErrors.exercises = "At least one exercise is required";
        valid = false;
      }

      const exerciseErrors: WorkoutCreateErrors["exerciseFields"] = {};

      exercises.forEach((ex) => {
        const e: { sets?: string; reps?: string } = {};
        if (ex.sets <= 0) e.sets = "Required";
        if (ex.reps <= 0) e.reps = "Required";

        if (Object.keys(e).length > 0) {
          exerciseErrors![ex.id] = e;
          valid = false;
        }
      });

      if (Object.keys(exerciseErrors!).length > 0) {
        nextErrors.exerciseFields = exerciseErrors;
      }
    }

    setErrors(nextErrors);
    return valid;
  };

  const createOrUpdateWorkout = () => {
    if (!validate()) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const workoutDto: WorkoutDTO = {
      id: isEditMode && workout ? workout.id : crypto.randomUUID(),
      title,
      muscleGroups: selectedMuscles,
      mainFocus: selectedMuscles[0],
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      completedAt: workout?.completedAt
        ? workout.completedAt.toISOString()
        : null,
      exercises,
    };

    router.replace("?modal=closed");

    mutation.mutate(workoutDto);
  };

  return {
    isEditMode,

    title,
    setTitle,
    date,
    time,
    dateRef,
    timeRef,
    setDate,
    setTime,

    muscleInput,
    setMuscleInput,
    selectedMuscles,
    tempSelected,
    filteredMuscles,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    toggleTemp,
    confirmAddMuscles,
    removeMuscle,

    exercises,
    addExercise,
    removeExercise,
    updateExercise,

    createOrUpdateWorkout,
    errors,
    showToast,
  };
};
