import { fetchWorkoutsMock } from "./workoutsApi.mock";
import { fetchWorkoutsApi } from "./workoutsApi.real";

const mode = process.env.NEXT_PUBLIC_API_MODE;

export const fetchWorkouts = () => {
  if (mode === "mock") {
    return fetchWorkoutsMock();
  }

  return fetchWorkoutsApi();
};