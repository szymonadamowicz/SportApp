import {
  optimisticAddWorkout,
  rollbackWorkouts,
} from "@/api/cache/workouts.cache";
import { workoutsKeys } from "@/api/keys/workouts.keys";
import { Workout } from "@/types/workout/workout";
import { QueryClient } from "@tanstack/react-query";

type QueryKey = readonly unknown[];

type QueryUpdater<T> = T | ((old: T | undefined) => T | undefined);

const makeWorkout = (id: string): Workout => ({
  id,
  title: `Workout ${id}`,
  scheduledAt: new Date("2026-01-01T08:00:00.000Z"),
  exercises: [],
});

const createClientStub = (initial: Workout[] | undefined) => {
  let cache = initial;

  const client = {
    getQueryData: jest.fn(() => cache),
    setQueryData: jest.fn((key: QueryKey, next: QueryUpdater<Workout[]>) => {
      void key;
      cache =
        typeof next === "function"
          ? (next as (old: Workout[] | undefined) => Workout[] | undefined)(
              cache,
            )
          : next;
      return cache;
    }),
  } as unknown as QueryClient;

  return {
    client,
    getCache: () => cache,
  };
};

describe("workouts cache helpers", () => {
  it("optimistically prepends workout and returns previous state", () => {
    const existing = [makeWorkout("w1")];
    const { client, getCache } = createClientStub(existing);

    const previous = optimisticAddWorkout(client, makeWorkout("w2"));

    expect(previous).toEqual(existing);
    expect(getCache()).toEqual([
      expect.objectContaining({ id: "w2" }),
      existing[0],
    ]);
  });

  it("creates cache list when missing", () => {
    const { client, getCache } = createClientStub(undefined);

    const previous = optimisticAddWorkout(client, makeWorkout("w1"));

    expect(previous).toBeUndefined();
    expect(getCache()).toEqual([expect.objectContaining({ id: "w1" })]);
  });

  it("rolls back cache when previous value exists", () => {
    const previous = [makeWorkout("old")];
    const { client, getCache } = createClientStub([makeWorkout("new")]);

    rollbackWorkouts(client, previous);

    expect(getCache()).toEqual(previous);
  });

  it("does not touch cache when rollback has no previous value", () => {
    const original = [makeWorkout("w1")];
    const { client, getCache } = createClientStub(original);

    rollbackWorkouts(client, undefined);

    expect(getCache()).toEqual(original);
    expect(
      (client as unknown as { setQueryData: jest.Mock }).setQueryData,
    ).not.toHaveBeenCalledWith(workoutsKeys.all, undefined);
  });
});
