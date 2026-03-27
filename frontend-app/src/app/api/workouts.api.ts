import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { CreateWorkoutPayload, Workout } from "@/types/workout/workout";
import { workoutsMock } from "./apiMock/workouts/workouts.mock";
import { workoutsReal } from "./apiReal/workouts.real";
import { API_MODE } from "./env";

const impl = API_MODE === "mock" ? workoutsMock : workoutsReal;

export const fetchWorkoutsApi = (): Promise<WorkoutDTO[]> =>
  impl.fetchWorkouts();

export const fetchLastCompletedWorkoutApi = (): Promise<WorkoutDTO | null> =>
  impl.fetchLastCompletedWorkout();

export const createWorkoutApi = (
  payload: CreateWorkoutPayload,
): Promise<WorkoutDTO> => impl.createWorkout(payload);

export const patchWorkoutMetaApi = (workout: Workout): Promise<WorkoutDTO> =>
  impl.patchWorkoutMeta(workout.id, {
    scheduledAt: workout.scheduledAt?.toISOString?.() ?? null,
    completedAt: workout.completedAt?.toISOString?.() ?? null,
    perceivedLoad: workout.perceivedLoad,
  });

export const putWorkoutStructureApi = (workout: Workout): Promise<WorkoutDTO> =>
  impl.putWorkoutStructure(workout.id, {
    title: workout.title,
    muscleGroups: workout.muscleGroups ?? [],
    exercises: workout.exercises.map((e) => ({
      id: e.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight ?? 0,
      restTimeSec: e.restTimeSec ?? 0,
    })),
  });

export const deleteWorkoutApi = (id: string): Promise<boolean> =>
  impl.deleteWorkout(id);
