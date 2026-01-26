import { httpClient } from "@/api/httpClient";
import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { CreateWorkoutPayload } from "@/types/workout/workout";

type UpdateWorkoutMetaDto = {
  scheduledAt?: string | null;
  completedAt?: string | null;
  perceivedLoad?: string | null;
};

type UpdateWorkoutStructureDto = {
  title: string;
  exercises: WorkoutDTO["exercises"];
};

export const workoutsReal = {
  fetchWorkouts(): Promise<WorkoutDTO[]> {
    return httpClient<WorkoutDTO[]>("/workouts");
  },

  fetchLastCompletedWorkout(): Promise<WorkoutDTO | null> {
    return httpClient<WorkoutDTO | null>("/workouts/lastCompleted");
  },

  createWorkout(payload: CreateWorkoutPayload): Promise<WorkoutDTO> {
    return httpClient<WorkoutDTO>("/workouts", {
      method: "POST",
      body: payload.workout,
    });
  },

  patchWorkoutMeta(id: string, dto: UpdateWorkoutMetaDto): Promise<WorkoutDTO> {
    return httpClient<WorkoutDTO>(`/workouts/${id}`, {
      method: "PATCH",
      body: {
        scheduledAt: dto.scheduledAt ?? null,
        completedAt: dto.completedAt ?? null,
        perceivedLoad: dto.perceivedLoad ?? null,
      },
    });
  },

  putWorkoutStructure(
    id: string,
    dto: UpdateWorkoutStructureDto,
  ): Promise<WorkoutDTO> {
    return httpClient<WorkoutDTO>(`/workouts/${id}`, {
      method: "PUT",
      body: dto,
    });
  },
};
