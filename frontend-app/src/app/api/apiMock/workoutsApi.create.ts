import { CreateWorkoutPayload } from "@/types/workout/workout";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

export const createWorkoutApi = async (
  payload: CreateWorkoutPayload
): Promise<WorkoutDTO> => {
  await new Promise((r) => setTimeout(r, 200));
  return payload.workout;
};
