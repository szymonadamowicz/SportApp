import { fetchWorkoutsMock } from "./apiMock/workoutsApi.mock";
import { fetchWorkoutsApi } from "./apiReal/workoutsApi.real";

const mode = process.env.NEXT_PUBLIC_API_MODE;

export const fetchWorkouts = () => {
  if (mode === "mock") {
    return fetchWorkoutsMock();
  }

  return fetchWorkoutsApi();
};