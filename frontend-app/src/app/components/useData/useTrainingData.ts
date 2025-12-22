import { Workouts } from "@/mocks/WorkoutsPageMocks";
import { Exercise, Workout } from "@/types/types";

export const useTrainingData = () => {
  const trainings: Workout[] = Workouts;

  const WorkoutsLeft: Workout[] = trainings.filter((workout) => !workout.completed);
  const WorkoutsDone: Workout[] = trainings.filter((workout) => workout.completed);
  const mapExerciseToString = (exercise: Exercise) => {
  return `${exercise.name} ${exercise.reps} × ${exercise.sets}`;
};

  return { trainings, WorkoutsLeft, WorkoutsDone, mapExerciseToString };
};