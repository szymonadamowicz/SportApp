import { WorkoutDTO } from "@/types/workout/workoutDTO";
import {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
} from "@/types/workout/workout";
import { workoutsMock } from "./workouts.mock";
import { workoutsReal } from "./workouts.real";

const mode = process.env.NEXT_PUBLIC_API_MODE;
const impl = mode === "mock" ? workoutsMock : workoutsReal;

export const fetchWorkoutsApi = (): Promise<WorkoutDTO[]> =>
  impl.fetchWorkouts();

export const fetchLastCompletedWorkoutApi = (): Promise<WorkoutDTO | null> =>
  impl.fetchLastCompletedWorkout();

export const createWorkoutApi = (
  payload: CreateWorkoutPayload
): Promise<WorkoutDTO> => impl.createWorkout(payload);

export const updateWorkoutApi = (
  payload: UpdateWorkoutPayload
): Promise<WorkoutDTO> => impl.updateWorkout(payload);
