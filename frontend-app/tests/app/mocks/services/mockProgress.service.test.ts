import { mockProgressService } from "@/mocks/services/mockProgress.service";
import { workoutsRepository } from "@/mocks/repositories/workouts.repository";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

jest.mock("@/mocks/runtime/delay", () => ({
  mockDelay: jest.fn(() => Promise.resolve()),
}));

const sampleWorkouts: WorkoutDTO[] = [
  {
    id: "w-today",
    title: "Today",
    scheduledAt: "2026-04-03T08:00:00.000Z",
    completedAt: "2026-04-03T09:00:00.000Z",
    exercises: [{ id: "e1", name: "Bench", sets: 2, reps: 5, weight: 100 }],
  },
  {
    id: "w-yesterday",
    title: "Yesterday",
    scheduledAt: "2026-04-02T08:00:00.000Z",
    completedAt: "2026-04-02T09:00:00.000Z",
    exercises: [
      { id: "e2", name: "Bench", sets: 3, reps: 5, weight: 90 },
      { id: "e3", name: "Squat", sets: 2, reps: 4, weight: 120 },
    ],
  },
  {
    id: "w-old",
    title: "Old",
    scheduledAt: "2026-03-20T08:00:00.000Z",
    completedAt: "2026-03-20T09:00:00.000Z",
    exercises: [{ id: "e4", name: "Bench", sets: 1, reps: 10, weight: 80 }],
  },
  {
    id: "w-planned",
    title: "Planned",
    scheduledAt: "2026-04-06T08:00:00.000Z",
    completedAt: null,
    exercises: [],
  },
];

describe("mockProgressService", () => {
  let listSpy: jest.SpiedFunction<typeof workoutsRepository.list>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-04-03T12:00:00.000Z"));
    listSpy = jest
      .spyOn(workoutsRepository, "list")
      .mockReturnValue(sampleWorkouts);
  });

  afterEach(() => {
    listSpy.mockRestore();
    jest.useRealTimers();
  });

  it("builds progress for all workouts", async () => {
    const result = await mockProgressService.fetchProgress("all");

    expect(result.streak).toEqual({
      current: 2,
      longest: 2,
      lastWorkoutDate: "2026-04-03T00:00:00.000Z",
    });

    expect(result.stats).toEqual({
      totalWorkouts: 3,
      totalReps: 43,
      totalVolume: 4110,
      maxWeight: 120,
    });

    expect(result.prs).toEqual([
      { exerciseName: "Squat", maxWeight: 120 },
      { exerciseName: "Bench", maxWeight: 100 },
    ]);
  });

  it("filters stats and PRs by week scope", async () => {
    const result = await mockProgressService.fetchProgress("week");

    expect(result.stats).toEqual({
      totalWorkouts: 2,
      totalReps: 33,
      totalVolume: 3310,
      maxWeight: 120,
    });

    expect(result.prs).toEqual([
      { exerciseName: "Squat", maxWeight: 120 },
      { exerciseName: "Bench", maxWeight: 100 },
    ]);

    expect(result.streak.current).toBe(2);
  });

  it("keeps current streak when latest completed workout was yesterday", async () => {
    listSpy.mockReturnValue(sampleWorkouts.filter((workout) => workout.id !== "w-today"));

    const result = await mockProgressService.fetchProgress("all");

    expect(result.streak.current).toBe(1);
    expect(result.streak.longest).toBe(1);
  });

  it("keeps longest streak when current streak is broken", async () => {
    listSpy.mockReturnValue([
      {
        id: "w-older-a",
        title: "Older A",
        scheduledAt: "2026-03-20T08:00:00.000Z",
        completedAt: "2026-03-20T09:00:00.000Z",
        exercises: [],
      },
      {
        id: "w-older-b",
        title: "Older B",
        scheduledAt: "2026-03-21T08:00:00.000Z",
        completedAt: "2026-03-21T09:00:00.000Z",
        exercises: [],
      },
      {
        id: "w-later",
        title: "Later",
        scheduledAt: "2026-03-25T08:00:00.000Z",
        completedAt: "2026-03-25T09:00:00.000Z",
        exercises: [],
      },
    ]);

    const result = await mockProgressService.fetchProgress("all");

    expect(result.streak.current).toBe(0);
    expect(result.streak.longest).toBe(2);
  });
});
