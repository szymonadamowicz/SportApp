import { mockWorkoutService } from "@/mocks/services/mockWorkout.service";
import { workoutsRepository } from "@/mocks/repositories/workouts.repository";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

jest.mock("@/mocks/runtime/delay", () => ({
  mockDelay: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/mocks/repositories/workouts.repository", () => ({
  workoutsRepository: {
    list: jest.fn(),
    getLastCompleted: jest.fn(),
    create: jest.fn(),
    updateMeta: jest.fn(),
    updateStructure: jest.fn(),
    delete: jest.fn(),
  },
}));

const workoutsRepositoryMock = workoutsRepository as jest.Mocked<
  typeof workoutsRepository
>;

const baseWorkout: WorkoutDTO = {
  id: "w1",
  title: "Leg day",
  scheduledAt: "2026-04-03T10:00:00.000Z",
  completedAt: null,
  exercises: [
    {
      id: "e1",
      name: "Squat",
      sets: 3,
      reps: 8,
      weight: 100,
    },
  ],
};

describe("mockWorkoutService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns workouts list", async () => {
    workoutsRepositoryMock.list.mockReturnValue([baseWorkout]);

    const result = await mockWorkoutService.fetchWorkouts();

    expect(workoutsRepositoryMock.list).toHaveBeenCalled();
    expect(result).toEqual([baseWorkout]);
  });

  it("returns last completed workout", async () => {
    workoutsRepositoryMock.getLastCompleted.mockReturnValue(baseWorkout);

    const result = await mockWorkoutService.fetchLastCompletedWorkout();

    expect(workoutsRepositoryMock.getLastCompleted).toHaveBeenCalled();
    expect(result?.id).toBe("w1");
  });

  it("creates workout", async () => {
    workoutsRepositoryMock.create.mockReturnValue(baseWorkout);

    const result = await mockWorkoutService.createWorkout(baseWorkout);

    expect(workoutsRepositoryMock.create).toHaveBeenCalledWith(baseWorkout);
    expect(result.title).toBe("Leg day");
  });

  it("patches workout meta", async () => {
    const patch = {
      completedAt: "2026-04-03T11:00:00.000Z",
      perceivedLoad: "balanced" as const,
    };
    workoutsRepositoryMock.updateMeta.mockReturnValue({
      ...baseWorkout,
      ...patch,
    });

    const result = await mockWorkoutService.patchWorkoutMeta("w1", patch);

    expect(workoutsRepositoryMock.updateMeta).toHaveBeenCalledWith("w1", patch);
    expect(result.completedAt).toBe("2026-04-03T11:00:00.000Z");
  });

  it("passes null completedAt when clearing completion", async () => {
    const patch = {
      completedAt: null,
      perceivedLoad: "easy" as const,
    };
    workoutsRepositoryMock.updateMeta.mockReturnValue({
      ...baseWorkout,
      ...patch,
    });

    const result = await mockWorkoutService.patchWorkoutMeta("w1", patch);

    expect(workoutsRepositoryMock.updateMeta).toHaveBeenCalledWith("w1", patch);
    expect(result.completedAt).toBeNull();
  });

  it("updates workout structure", async () => {
    const patch = {
      title: "Push day",
      muscleGroups: ["chest", "triceps"],
      exercises: [
        {
          id: "e2",
          name: "Bench Press",
          sets: 4,
          reps: 6,
          weight: 90,
        },
      ],
    };

    workoutsRepositoryMock.updateStructure.mockReturnValue({
      ...baseWorkout,
      ...patch,
    });

    const result = await mockWorkoutService.putWorkoutStructure("w1", patch);

    expect(workoutsRepositoryMock.updateStructure).toHaveBeenCalledWith(
      "w1",
      patch,
    );
    expect(result.title).toBe("Push day");
  });

  it("deletes workout", async () => {
    workoutsRepositoryMock.delete.mockReturnValue(true);

    const deleted = await mockWorkoutService.deleteWorkout("w1");

    expect(workoutsRepositoryMock.delete).toHaveBeenCalledWith("w1");
    expect(deleted).toBe(true);
  });
});
