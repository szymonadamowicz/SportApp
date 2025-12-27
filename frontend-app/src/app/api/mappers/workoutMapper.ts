import { Exercise, Workout } from "@/types/workout";
import { WorkoutDTO, ExerciseDTO } from "@/types/workoutDTO";

const mapExerciseDTO = (dto: ExerciseDTO): Exercise => ({
  id: dto.id,
  name: dto.name,
  sets: dto.sets,
  reps: dto.reps,
  weight: dto.weight,
  restTimeSec: dto.restTimeSec,
  muscleGroups: dto.muscleGroups,
});

export const mapWorkoutDTO = (dto: WorkoutDTO): Workout => ({
  id: dto.id,
  title: dto.title,
  scheduledAt: new Date(dto.scheduledAt),
  completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
  muscleGroup: dto.muscleGroup ?? "",
  exercises: dto.exercises.map(mapExerciseDTO),
  notes: dto.notes,
});
