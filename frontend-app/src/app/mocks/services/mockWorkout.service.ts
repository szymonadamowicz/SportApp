import { workoutsRepository } from "@/mocks/repositories/workouts.repository";
import { mockDelay } from "@/mocks/runtime/delay";
import { FeedbackValue } from "@/types/pages/progressPage";
import { UpdateWorkoutStructureDto } from "@/types/workout/workoutApi";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

export const mockWorkoutService = {
  async fetchWorkouts(): Promise<WorkoutDTO[]> {
    await mockDelay(150);
    return workoutsRepository.list();
  },

  async fetchLastCompletedWorkout(): Promise<WorkoutDTO | null> {
    await mockDelay(80);
    return workoutsRepository.getLastCompleted();
  },

  async createWorkout(workout: WorkoutDTO): Promise<WorkoutDTO> {
    await mockDelay(150);
    return workoutsRepository.create(workout);
  },

  async patchWorkoutMeta(
    id: string,
    patch: {
      scheduledAt?: string | null;
      completedAt?: string | null;
      perceivedLoad?: FeedbackValue;
    },
  ): Promise<WorkoutDTO> {
    await mockDelay(100);
    return workoutsRepository.updateMeta(id, patch);
  },

  async putWorkoutStructure(
    id: string,
    patch: UpdateWorkoutStructureDto,
  ): Promise<WorkoutDTO> {
    await mockDelay(120);
    return workoutsRepository.updateStructure(id, patch);
  },

  async deleteWorkout(id: string): Promise<boolean> {
    await mockDelay(100);
    return workoutsRepository.delete(id);
  },
};
