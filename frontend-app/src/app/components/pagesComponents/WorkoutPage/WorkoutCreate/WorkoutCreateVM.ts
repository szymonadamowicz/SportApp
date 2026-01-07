"use client";

import { useCreateWorkout } from "@/hooks/apiHooks/useCreateWorkouts";
import { useEffect, useRef, useState } from "react";
import { WorkoutDTO, ExerciseDTO } from "@/types/workout/workoutDTO";
import { WorkoutCreateErrors } from "@/types/pages/workoutPage";

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

export const useCreateWorkoutVM = () => {
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

  const mutation = useCreateWorkout();

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

    setErrors(nextErrors);
    return valid;
  };

  const createWorkout = () => {
    if (!validate()) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const workoutDto: WorkoutDTO = {
      id: crypto.randomUUID(),
      title,
      muscleGroups: selectedMuscles,
      mainFocus: selectedMuscles[0],
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      completedAt: null,
      exercises,
    };

    mutation.mutate(workoutDto);
  };

  return {
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

    createWorkout,
    errors,
    showToast,
  };
};
