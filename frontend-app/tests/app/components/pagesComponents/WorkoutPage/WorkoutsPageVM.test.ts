import { act, renderHook } from "@testing-library/react";
import { useWorkoutsPageVM } from "@/components/pagesComponents/WorkoutPage/WorkoutsPageVM";

const pushMock = jest.fn();
const setSeeAllMock = jest.fn();

jest.mock("@/hooks/apiHooks/workouts/useWorkouts", () => ({
  useWorkouts: () => ({
    allWorkouts: [
      {
        id: "w1",
        title: "W1",
        scheduledAt: new Date("2030-01-01T12:00:00.000Z"),
        exercises: [],
      },
    ],
  }),
}));

jest.mock("@/hooks/helperHooks/useNow", () => ({
  useNow: () => new Date("2026-01-01T12:00:00.000Z"),
}));

jest.mock("@/hooks/useLocalStorageState", () => ({
  useLocalStorageState: () => [false, setSeeAllMock],
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "selected") return "w1";
      return null;
    },
  }),
}));

describe("useWorkoutsPageVM", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hydrates selected workout from query and toggles selection off on same item click", async () => {
    const { result } = renderHook(() => useWorkoutsPageVM());

    expect(result.current.selectedWorkoutId).toBe("w1");
    expect(result.current.selectedWorkout?.id).toBe("w1");

    act(() => {
      result.current.setSelectWorkout("w1");
    });

    expect(result.current.selectedWorkoutId).toBeUndefined();
  });
});
