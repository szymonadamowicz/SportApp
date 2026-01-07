import { UpdateWorkoutPayload } from "@/types/workout/workout";

export const updateWorkoutApi = async (
  payload: UpdateWorkoutPayload
): Promise<UpdateWorkoutPayload> => {
  await new Promise((r) => setTimeout(r, 100));
  return payload;
};
