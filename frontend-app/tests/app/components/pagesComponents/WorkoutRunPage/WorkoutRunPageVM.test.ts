import { act, renderHook } from "@testing-library/react";
import { useWorkoutRunPageVM } from "@/components/pagesComponents/WorkoutRunPage/WorkoutRunPageVM";

const startMutateAsync = jest.fn();
const completeMutateAsync = jest.fn();
const saveProgressMock = jest.fn();
const pushMock = jest.fn();
const mockSetQueryData = jest.fn();

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({ setQueryData: mockSetQueryData }),
  };
});

jest.mock("@/hooks/apiHooks/workoutRun/useActiveWorkoutRun", () => ({
  useActiveWorkoutRun: () => ({ activeRun: null, isLoading: false }),
}));

jest.mock("@/hooks/apiHooks/workoutRun/useStartWorkoutRun", () => ({
  useStartWorkoutRun: () => ({ mutateAsync: startMutateAsync }),
}));

jest.mock("@/hooks/apiHooks/workoutRun/useCompleteWorkoutRun", () => ({
  useCompleteWorkoutRun: () => ({ mutateAsync: completeMutateAsync }),
}));

jest.mock("@/hooks/apiHooks/workoutRun/useSaveWorkoutRunProgress", () => ({
  useSaveWorkoutRunProgress: () => ({ mutateAsync: saveProgressMock }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const startedSession = {
  runId: "run-1",
  workoutId: "w1",
  workoutTitle: "Leg Day",
  startedAt: new Date("2026-04-11T10:00:00.000Z"),
  steps: [
    {
      stepIndex: 0,
      exerciseId: "e1",
      exerciseName: "Squat",
      setNumber: 1,
      totalSets: 1,
      expectedReps: 8,
      restSeconds: 60,
      exerciseSeconds: 40,
    },
  ],
};

const startedSessionTwoSteps = {
  runId: "run-2",
  workoutId: "w2",
  workoutTitle: "Upper Day",
  startedAt: new Date("2026-04-11T10:00:00.000Z"),
  steps: [
    {
      stepIndex: 0,
      exerciseId: "e1",
      exerciseName: "Bench",
      setNumber: 1,
      totalSets: 1,
      expectedReps: 8,
      restSeconds: 30,
      exerciseSeconds: 40,
    },
    {
      stepIndex: 1,
      exerciseId: "e2",
      exerciseName: "Row",
      setNumber: 1,
      totalSets: 1,
      expectedReps: 10,
      restSeconds: 30,
      exerciseSeconds: 40,
    },
  ],
};

describe("useWorkoutRunPageVM", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    startMutateAsync.mockResolvedValue(startedSession);
    completeMutateAsync.mockResolvedValue({
      runId: "run-1",
      workoutId: "w1",
      finishedAt: new Date("2026-04-11T10:05:00.000Z"),
      totalSets: 1,
      metTargetSets: 1,
      expectedRepsTotal: 8,
      actualRepsTotal: 8,
      completionRate: 100,
    });
  });

  it("starts, records set feedback, and completes workout run", async () => {
    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.session?.runId).toBe("run-1");
    expect(result.current.status).toBe("running");

    act(() => {
      result.current.setPendingActualReps("8");
      result.current.setPendingMetTarget(true);
      result.current.saveSetAndContinue();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.phase).toBe("summary");

    await act(async () => {
      await result.current.finishSession();
    });

    expect(completeMutateAsync).toHaveBeenCalled();
    expect(result.current.status).toBe("completed");
    expect(result.current.summary?.completionRate).toBe(100);
  });

  it("allows skipping current exercise and logs skipped entry", async () => {
    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    act(() => {
      result.current.skipExercise();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].actualReps).toBe(0);
    expect(result.current.entries[0].metTarget).toBe(false);
    expect(result.current.phase).toBe("summary");
  });

  it("allows finishing workout before summary phase", async () => {
    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    await act(async () => {
      await result.current.finishSession();
    });

    expect(completeMutateAsync).toHaveBeenCalled();
    expect(result.current.status).toBe("completed");
  });

  it("supports moving back to previous step", async () => {
    startMutateAsync.mockResolvedValueOnce(startedSessionTwoSteps);

    const { result } = renderHook(() => useWorkoutRunPageVM("w2"));

    await act(async () => {
      await result.current.startSession();
    });

    act(() => {
      result.current.saveSetAndContinue();
    });

    act(() => {
      result.current.skipRest();
    });

    expect(result.current.currentStepIndex).toBe(1);

    act(() => {
      result.current.goToPreviousStep();
    });

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.phase).toBe("exercise");
  });

  it("navigates back to workouts", () => {
    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    act(() => {
      result.current.backToWorkouts();
    });

    expect(pushMock).toHaveBeenCalledWith("/workouts");
  });
});
