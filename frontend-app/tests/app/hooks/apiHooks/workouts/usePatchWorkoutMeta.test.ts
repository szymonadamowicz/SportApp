import { usePatchWorkoutMeta } from "@/hooks/apiHooks/workouts/usePatchWorkoutMeta";
import { patchWorkoutMetaApi } from "@/api/workouts.api";
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
  patchWorkoutMetaApi: jest.fn(),
}));

const patchWorkoutMetaApiMock = patchWorkoutMetaApi as jest.MockedFunction<
  typeof patchWorkoutMetaApi
>;

const makeWorkout = (id: string, title = `Workout ${id}`): Workout => ({
  id,
  title,
  scheduledAt: new Date("2026-01-01T08:00:00.000Z"),
  exercises: [],
});

describe("usePatchWorkoutMeta", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryState.workouts = undefined;
  });

  it("configures optimistic patch, rollback and invalidation", async () => {
    const existing = [makeWorkout("w1", "Original"), makeWorkout("w2")];
    queryState.workouts = existing;

    usePatchWorkoutMeta();

    const options = useMutationMock.mock.calls[0][0] as {
      onMutate: (w: Workout) => Promise<{ previous?: Workout[] }>;
      onError: (
        err: Error,
        payload: Workout,
        ctx?: { previous?: Workout[] },
      ) => void;
      onSettled: () => void;
    };

    const nextWorkout: Workout = {
      ...existing[0],
      title: "Updated",
      perceivedLoad: "balanced",
    };

    const ctx = await options.onMutate(nextWorkout);

    expect(queryClientMock.cancelQueries).toHaveBeenCalledWith({
      queryKey: workoutsKeys.all,
    });
    expect(ctx.previous).toEqual(existing);
    const patched = queryState.workouts?.find((w) => w.id === "w1");
    expect(patched?.title).toBe("Original");
    expect(patched?.perceivedLoad).toBe("balanced");

    options.onError(new Error("boom"), nextWorkout, ctx);

    expect(queryState.workouts).toEqual(existing);

    options.onSettled();

    expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith({
      queryKey: workoutsKeys.all,
    });
  });

  it("maps patched dto in mutationFn", async () => {
    usePatchWorkoutMeta();

    const options = useMutationMock.mock.calls[0][0] as {
      mutationFn: (w: Workout) => Promise<Workout>;
    };

    const payload = makeWorkout("w1", "Meta update");

    patchWorkoutMetaApiMock.mockResolvedValue({
      id: "w1",
      title: "Meta update",
      scheduledAt: "2026-01-01T09:00:00.000Z",
      completedAt: null,
      perceivedLoad: "balanced",
      exercises: [],
    });

    const result = await options.mutationFn(payload);

    expect(patchWorkoutMetaApiMock).toHaveBeenCalledWith(payload);
    expect(result.id).toBe("w1");
    expect(result.scheduledAt).toBeInstanceOf(Date);
  });
});
