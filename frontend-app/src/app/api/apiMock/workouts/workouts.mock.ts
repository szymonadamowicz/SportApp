import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { CreateWorkoutPayload } from "@/types/workout/workout";
import { mapWorkoutToDTO } from "@/api/mappers/workout/workoutMapper";
import { FeedbackValue } from "@/types/pages/progressPage";
import { mockWorkoutService } from "@/mocks/services/mockWorkout.service";
import { UpdateWorkoutStructureDto } from "@/types/workout/workoutApi";

export const workoutsMock = {
  fetchWorkouts(): Promise<WorkoutDTO[]> {
    return mockWorkoutService.fetchWorkouts();
  },

  fetchLastCompletedWorkout(): Promise<WorkoutDTO | null> {
    return mockWorkoutService.fetchLastCompletedWorkout();
  },

  createWorkout(payload: CreateWorkoutPayload): Promise<WorkoutDTO> {
    const data = mapWorkoutToDTO(payload.workout);
    return mockWorkoutService.createWorkout(data);
  },

  patchWorkoutMeta(
    id: string,
    dto: {
      scheduledAt?: string | null;
      completedAt?: string | null;
      perceivedLoad?: FeedbackValue;
    },
  ): Promise<WorkoutDTO> {
    return mockWorkoutService.patchWorkoutMeta(id, dto);
  },

  putWorkoutStructure(
    id: string,
    dto: UpdateWorkoutStructureDto,
  ): Promise<WorkoutDTO> {
    return mockWorkoutService.putWorkoutStructure(id, dto);
  },

  deleteWorkout(id: string): Promise<boolean> {
    return mockWorkoutService.deleteWorkout(id);
  },
};
