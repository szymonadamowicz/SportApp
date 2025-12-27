import { Exercise } from "@/types/workout";

export const formatExerciseShort = (exercise: Exercise) =>
  `${exercise.name} ${exercise.reps} × ${exercise.sets}`;
