import { WorkoutsApiMock } from "@/mocks/WorkoutsPageMocks";
import { WorkoutDTO } from "@/types/workoutDTO";

export const fetchWorkoutsMock = async (): Promise<WorkoutDTO[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return WorkoutsApiMock;
};
