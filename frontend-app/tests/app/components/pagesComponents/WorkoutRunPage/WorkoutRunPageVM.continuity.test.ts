import { act, renderHook } from "@testing-library/react";
import { useWorkoutRunPageVM } from "@/components/pagesComponents/WorkoutRunPage/WorkoutRunPageVM";

const getActiveRunMock = jest.fn();
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
  useActiveWorkoutRun: jest.fn((workoutId) => ({
    activeRun: getActiveRunMock(workoutId),
    isLoading: false,
  })),
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

jest.useFakeTimers();

const baseSession = {
  runId: "run-1",
  workoutId: "w1",
  workoutTitle: "Leg Day",
  startedAt: new Date("2026-04-11T10:00:00.000Z"),
  isResumed: false,
  nextStepIndex: 0,
  durationSec: undefined,
  notes: undefined,
  entries: [],
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
    {
      stepIndex: 1,
      exerciseId: "e2",
      exerciseName: "Leg Press",
      setNumber: 1,
      totalSets: 1,
      expectedReps: 10,
      restSeconds: 60,
      exerciseSeconds: 40,
    },
  ],
};

const resumeSession = {
  ...baseSession,
  isResumed: true,
  nextStepIndex: 1,
  durationSec: 120,
  notes: "Good start",
  entries: [
    {
      stepIndex: 0,
      exerciseId: "e1",
      exerciseName: "Squat",
      setNumber: 1,
      expectedReps: 8,
      actualReps: 8,
      metTarget: true,
      exerciseDurationSec: 40,
      restDurationSec: 60,
      completedAt: "2026-04-11T10:02:00.000Z",
    },
  ],
};

describe("useWorkoutRunPageVM - session continuity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getActiveRunMock.mockReturnValue(null);
    startMutateAsync.mockResolvedValue(baseSession);
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
    saveProgressMock.mockResolvedValue(resumeSession);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("restores session from active run if available", async () => {
    getActiveRunMock.mockReturnValue(resumeSession);

    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.session?.isResumed).toBe(true);
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.notes).toBe("Good start");
  });

  it("restores saved rest phase and timer state", async () => {
    getActiveRunMock.mockReturnValue({
      ...resumeSession,
      activePhase: "rest",
      currentStepIndex: 0,
      remainingSeconds: 23,
      phaseDurationSec: 60,
      isPaused: true,
    });

    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.phase).toBe("rest");
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.secondsLeft).toBe(23);
    expect(result.current.phaseDuration).toBe(60);
    expect(result.current.isPaused).toBe(true);
  });

  it("starts fresh session if no active run exists", async () => {
    getActiveRunMock.mockReturnValue(null);

    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.session?.isResumed).toBe(false);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.entries).toEqual([]);
  });

  it("saves progress at regular intervals during active session", async () => {
    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    act(() => {
      result.current.setPendingActualReps("8");
      result.current.setPendingMetTarget(true);
      result.current.saveSetAndContinue();
    });

    expect(result.current.entries).toHaveLength(1);

    expect(saveProgressMock).toHaveBeenLastCalledWith({
      runId: "run-1",
      payload: expect.objectContaining({
        activePhase: "rest",
        currentStepIndex: 0,
        remainingSeconds: 60,
        phaseDurationSec: 60,
        isPaused: false,
        entries: expect.arrayContaining([
          expect.objectContaining({ stepIndex: 0, actualReps: 8 }),
        ]),
      }),
    });

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(saveProgressMock).toHaveBeenCalled();
  });

  it("lets a phase timer run past zero without auto-advancing", async () => {
    startMutateAsync.mockResolvedValueOnce({
      ...baseSession,
      steps: [
        {
          ...baseSession.steps[0],
          exerciseSeconds: 1,
        },
      ],
    });

    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(result.current.secondsLeft).toBeLessThan(0);
    expect(result.current.phase).toBe("exercise");
    expect(result.current.entries).toHaveLength(0);
  });

  it("autosaves progress when navigating away from session", async () => {
    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    act(() => {
      result.current.setPendingActualReps("8");
      result.current.setPendingMetTarget(true);
      result.current.saveSetAndContinue();
    });

    expect(result.current.entries).toHaveLength(1);

    await act(async () => {
      result.current.backToWorkouts();
      jest.advanceTimersByTime(1);
    });

    expect(saveProgressMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/workouts");
  });

  it("resumes from mid-session entries and continues from next step", async () => {
    getActiveRunMock.mockReturnValue(resumeSession);

    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.currentStep?.exerciseName).toBe("Leg Press");
    expect(result.current.status).toBe("running");
  });

  it("clears active session after completion", async () => {
    const { result } = renderHook(() => useWorkoutRunPageVM("w1"));

    await act(async () => {
      await result.current.startSession();
    });

    act(() => {
      result.current.saveSetAndContinue();
    });

    act(() => {
      result.current.skipRest();
    });

    act(() => {
      result.current.saveSetAndContinue();
    });

    await act(async () => {
      await result.current.finishSession();
    });

    expect(completeMutateAsync).toHaveBeenCalled();
    expect(result.current.status).toBe("completed");
  });
});
