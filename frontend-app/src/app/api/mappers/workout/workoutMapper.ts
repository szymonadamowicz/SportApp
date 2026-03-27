import { Exercise, Workout } from "@/types/workout/workout";
import { WorkoutDTO, ExerciseDTO } from "@/types/workout/workoutDTO";

const mapExerciseDTO = (dto: ExerciseDTO): Exercise => ({
  id: dto.id,
  orderIndex: dto.orderIndex,
  name: dto.name,
  sets: dto.sets,
  reps: dto.reps,
  weight: dto.weight,
  restTimeSec: dto.restTimeSec,
});

export const mapWorkoutDTO = (dto: WorkoutDTO): Workout => ({
  id: dto.id,
  title: dto.title,
  scheduledAt: new Date(dto.scheduledAt),
  completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
  perceivedLoad: dto.perceivedLoad ? dto.perceivedLoad : undefined,
  muscleGroups: dto.muscleGroups ? dto.muscleGroups : undefined,
  mainFocus: Array.isArray(dto.muscleGroups)
    ? dto.muscleGroups[0]
    : dto.mainFocus
      ? dto.mainFocus
      : undefined,
  exercises: dto.exercises
    .map((exercise, orderIndex) => ({
      ...mapExerciseDTO(exercise),
      orderIndex: exercise.orderIndex ?? orderIndex,
    }))
    .sort((left, right) => (left.orderIndex ?? 0) - (right.orderIndex ?? 0)),
});

export const mapWorkoutToDTO = (dto: Workout): WorkoutDTO => ({
  id: dto.id,
  title: dto.title,
  scheduledAt: dto.scheduledAt.toISOString(),
  completedAt: dto.completedAt ? dto.completedAt.toISOString() : undefined,
  perceivedLoad: dto.perceivedLoad ? dto.perceivedLoad : undefined,
  muscleGroups: dto.muscleGroups ? dto.muscleGroups : undefined,
  mainFocus: dto.mainFocus ? dto.mainFocus : undefined,
  exercises: dto.exercises
    .map((exercise, orderIndex) => ({
      ...mapExerciseDTO(exercise),
      orderIndex: exercise.orderIndex ?? orderIndex,
    }))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
});
