import { act, renderHook, waitFor } from "@testing-library/react";
import { useWorkoutModalVM } from "@/components/pagesComponents/WorkoutPage/WorkoutCreate/WorkoutModalVM";

const createMutate = jest.fn();
const updateMutateAsync = jest.fn();
const patchMetaMutateAsync = jest.fn();

const workout = {
  id: "w-edit",
  title: "Original",
  scheduledAt: new Date("2026-04-01T08:00:00.000Z"),
  completedAt: undefined,
  muscleGroups: ["legs"],
  mainFocus: "legs",
  exercises: [
    {
      id: "e1",
      name: "Squat",
      sets: 3,
      reps: 8,
      weight: 100,
      restTimeSec: 90,
    },
  ],
};

jest.mock("@/hooks/apiHooks/workouts/useCreateWorkout", () => ({
  useCreateWorkout: () => ({ mutate: createMutate }),
}));

jest.mock("@/hooks/apiHooks/workouts/usePutWorkoutStructure", () => ({
  usePutWorkoutStructure: () => ({ mutateAsync: updateMutateAsync }),
}));

jest.mock("@/hooks/apiHooks/workouts/usePatchWorkoutMeta", () => ({
  usePatchWorkoutMeta: () => ({ mutateAsync: patchMetaMutateAsync }),
}));

jest.mock("@/hooks/apiHooks/workouts/useWorkoutById", () => ({
  useWorkoutById: () => ({ workoutById: workout }),
}));

describe("useWorkoutModalVM", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateMutateAsync.mockResolvedValue(workout);
    patchMetaMutateAsync.mockResolvedValue(workout);
  });

  it("updates structure and meta in edit mode", async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useWorkoutModalVM({ open: true, editModalId: "w-edit", onClose }),
    );

    await waitFor(() => {
      expect(result.current.title).toBe("Original");
    });

    act(() => {
      result.current.setDate("2026-04-10");
      result.current.setTime("11:30");
      result.current.setTitle("Updated");
      result.current.setIsCompleted(true);
      result.current.setCompletedDate("2026-04-10");
      result.current.setCompletedTime("12:15");
    });

    await act(async () => {
      await result.current.createOrUpdateWorkout();
    });

    expect(updateMutateAsync).toHaveBeenCalled();
    expect(patchMetaMutateAsync).toHaveBeenCalled();
    const payload = patchMetaMutateAsync.mock.calls[0][0];
    expect(payload.completedAt).toBeInstanceOf(Date);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows row-level exercise errors and blocks save for incomplete exercise", async () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useWorkoutModalVM({ open: true, editModalId: "w-edit", onClose }),
    );

    await waitFor(() => {
      expect(result.current.title).toBe("Original");
    });

    act(() => {
      result.current.addExercise();
    });

    const addedId =
      result.current.exercises[result.current.exercises.length - 1].id;

    act(() => {
      result.current.updateExercise(addedId, {
        name: "Lunge",
        sets: 3,
        reps: 0,
      });
    });

    await act(async () => {
      await result.current.createOrUpdateWorkout();
    });

    expect(result.current.errors.exerciseFields?.[addedId]?.reps).toBe(
      "Reps must be > 0",
    );
    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(patchMetaMutateAsync).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
