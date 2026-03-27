import { useDeleteWorkout } from "@/hooks/apiHooks/workouts/useDeleteWorkout";
import { deleteWorkoutApi } from "@/api/workouts.api";
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
  deleteWorkoutApi: jest.fn(),
}));

const deleteWorkoutApiMock = deleteWorkoutApi as jest.MockedFunction<
  typeof deleteWorkoutApi
>;

const makeWorkout = (id: string): Workout => ({
  id,
  title: `Workout ${id}`,
  scheduledAt: new Date("2026-01-01T08:00:00.000Z"),
  exercises: [],
});

describe("useDeleteWorkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryState.workouts = undefined;
  });

  it("configures optimistic delete, rollback and invalidation", async () => {
    const existing = [makeWorkout("w1"), makeWorkout("w2")];
    queryState.workouts = existing;

    useDeleteWorkout();

    const options = useMutationMock.mock.calls[0][0] as {
      onMutate: (id: string) => Promise<{ previous?: Workout[] }>;
      onError: (err: Error, id: string, ctx?: { previous?: Workout[] }) => void;
      onSettled: () => void;
    };

    const ctx = await options.onMutate("w1");

    expect(queryClientMock.cancelQueries).toHaveBeenCalledWith({
      queryKey: workoutsKeys.all,
    });
    expect(ctx.previous).toEqual(existing);
    expect(queryState.workouts).toEqual([makeWorkout("w2")]);

    options.onError(new Error("boom"), "w1", ctx);

    expect(queryState.workouts).toEqual(existing);

    options.onSettled();

    expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith({
      queryKey: workoutsKeys.all,
    });
  });

  it("delegates mutationFn to deleteWorkoutApi", async () => {
    useDeleteWorkout();

    const options = useMutationMock.mock.calls[0][0] as {
      mutationFn: (id: string) => Promise<boolean>;
    };

    deleteWorkoutApiMock.mockResolvedValue(true);

    const result = await options.mutationFn("w1");

    expect(deleteWorkoutApiMock).toHaveBeenCalledWith("w1");
    expect(result).toBe(true);
  });
});
