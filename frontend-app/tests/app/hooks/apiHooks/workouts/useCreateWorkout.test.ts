import { useCreateWorkout } from "@/hooks/apiHooks/workouts/useCreateWorkout";
import { createWorkoutApi } from "@/api/workouts.api";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { Workout } from "@/types/workout/workout";

const useMutationMock = jest.fn((options: unknown) => options);

const queryState: { workouts: Workout[] | undefined } = {
  workouts: undefined,
};

const queryClientMock = {
  cancelQueries: jest.fn().mockResolvedValue(undefined),
  invalidateQueries: jest.fn(),
  getQueryData: jest.fn(() => queryState.workouts),
  setQueryData: jest.fn(
    (
      _key: readonly unknown[],
      next: Workout[] | ((old: Workout[] | undefined) => Workout[] | undefined),
    ) => {
      queryState.workouts =
        typeof next === "function" ? next(queryState.workouts) : next;
      return queryState.workouts;
    },
  ),
};

jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: unknown) => useMutationMock(options),
  useQueryClient: () => queryClientMock,
}));

jest.mock("@/api/workouts.api", () => ({
  createWorkoutApi: jest.fn(),
}));

const createWorkoutApiMock = createWorkoutApi as jest.MockedFunction<
  typeof createWorkoutApi
>;

const makeWorkout = (id: string): Workout => ({
  id,
  title: `Workout ${id}`,
  scheduledAt: new Date("2026-01-01T08:00:00.000Z"),
  exercises: [],
});

describe("useCreateWorkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryState.workouts = undefined;
  });

  it("configures optimistic add, rollback and invalidation", async () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1700000000000);
    queryState.workouts = [makeWorkout("existing")];

    useCreateWorkout();

    const options = useMutationMock.mock.calls[0][0] as {
      onMutate: (
        w: Workout,
      ) => Promise<{ previous?: Workout[]; optimisticId: string }>;
      onError: (
        err: Error,
        payload: Workout,
        ctx?: { previous?: Workout[]; optimisticId: string },
      ) => void;
      onSettled: () => void;
    };

    const payload = makeWorkout("new");
    const ctx = await options.onMutate(payload);

    expect(queryClientMock.cancelQueries).toHaveBeenCalledWith({
      queryKey: workoutsKeys.all,
    });
    expect(ctx.optimisticId).toBe("optimistic-1700000000000");
    expect(queryState.workouts?.[0].id).toBe("optimistic-1700000000000");

    options.onError(new Error("boom"), payload, ctx);

    expect(queryState.workouts).toEqual([makeWorkout("existing")]);

    options.onSettled();

    expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith({
      queryKey: workoutsKeys.all,
    });
    nowSpy.mockRestore();
  });

  it("maps created dto in mutationFn", async () => {
    useCreateWorkout();

    const options = useMutationMock.mock.calls[0][0] as {
      mutationFn: (w: Workout) => Promise<Workout>;
    };

    const payload = makeWorkout("draft");

    createWorkoutApiMock.mockResolvedValue({
      id: "created",
      title: "Created",
      scheduledAt: "2026-01-01T09:00:00.000Z",
      completedAt: null,
      exercises: [],
    });

    const result = await options.mutationFn(payload);

    expect(createWorkoutApiMock).toHaveBeenCalledWith({ workout: payload });
    expect(result.id).toBe("created");
    expect(result.scheduledAt).toBeInstanceOf(Date);
  });
});
