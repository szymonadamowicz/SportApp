import { workoutsMock } from "@/api/apiMock/workouts/workouts.mock";
import { mapWorkoutToDTO } from "@/api/mappers/workout/workoutMapper";
import { mockWorkoutService } from "@/mocks/services/mockWorkout.service";
import { CreateWorkoutPayload } from "@/types/workout/workout";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

jest.mock("@/api/mappers/workout/workoutMapper", () => ({
  mapWorkoutToDTO: jest.fn(),
}));

jest.mock("@/mocks/services/mockWorkout.service", () => ({
  mockWorkoutService: {
    fetchWorkouts: jest.fn(),
    fetchLastCompletedWorkout: jest.fn(),
    createWorkout: jest.fn(),
    patchWorkoutMeta: jest.fn(),
    putWorkoutStructure: jest.fn(),
    deleteWorkout: jest.fn(),
  },
}));

const mapWorkoutToDTOMock = mapWorkoutToDTO as jest.MockedFunction<
  typeof mapWorkoutToDTO
>;

const mockWorkoutServiceMock = mockWorkoutService as jest.Mocked<
  typeof mockWorkoutService
>;

const dtoWorkout: WorkoutDTO = {
  id: "w1",
  title: "Leg day",
  scheduledAt: "2026-04-03T08:00:00.000Z",
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

const payload: CreateWorkoutPayload = {
  workout: {
    id: "w1",
    title: "Leg day",
    scheduledAt: new Date("2026-04-03T08:00:00.000Z"),
    exercises: [
      {
        id: "e1",
        name: "Squat",
        sets: 3,
        reps: 8,
        weight: 100,
      },
    ],
  },
};

describe("workoutsMock adapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates fetchWorkouts", async () => {
    mockWorkoutServiceMock.fetchWorkouts.mockResolvedValue([dtoWorkout]);

    const result = await workoutsMock.fetchWorkouts();

    expect(mockWorkoutServiceMock.fetchWorkouts).toHaveBeenCalled();
    expect(result).toEqual([dtoWorkout]);
  });

  it("delegates fetchLastCompletedWorkout", async () => {
    mockWorkoutServiceMock.fetchLastCompletedWorkout.mockResolvedValue(
      dtoWorkout,
    );

    const result = await workoutsMock.fetchLastCompletedWorkout();

    expect(mockWorkoutServiceMock.fetchLastCompletedWorkout).toHaveBeenCalled();
    expect(result?.id).toBe("w1");
  });

  it("maps workout payload and delegates createWorkout", async () => {
    mapWorkoutToDTOMock.mockReturnValue(dtoWorkout);
    mockWorkoutServiceMock.createWorkout.mockResolvedValue(dtoWorkout);

    const result = await workoutsMock.createWorkout(payload);

    expect(mapWorkoutToDTOMock).toHaveBeenCalledWith(payload.workout);
    expect(mockWorkoutServiceMock.createWorkout).toHaveBeenCalledWith(
      dtoWorkout,
    );
    expect(result.id).toBe("w1");
  });

  it("delegates patchWorkoutMeta", async () => {
    const patch = {
      completedAt: "2026-04-03T10:00:00.000Z",
      perceivedLoad: "balanced" as const,
    };
    mockWorkoutServiceMock.patchWorkoutMeta.mockResolvedValue({
      ...dtoWorkout,
      ...patch,
    });

    const result = await workoutsMock.patchWorkoutMeta("w1", patch);

    expect(mockWorkoutServiceMock.patchWorkoutMeta).toHaveBeenCalledWith(
      "w1",
      patch,
    );
    expect(result.completedAt).toBe("2026-04-03T10:00:00.000Z");
  });

  it("delegates patchWorkoutMeta with null completedAt", async () => {
    const patch = {
      completedAt: null,
      perceivedLoad: "light" as const,
    };
    mockWorkoutServiceMock.patchWorkoutMeta.mockResolvedValue({
      ...dtoWorkout,
      ...patch,
    });

    const result = await workoutsMock.patchWorkoutMeta("w1", patch);

    expect(mockWorkoutServiceMock.patchWorkoutMeta).toHaveBeenCalledWith(
      "w1",
      patch,
    );
    expect(result.completedAt).toBeNull();
  });

  it("delegates putWorkoutStructure", async () => {
    const patch = {
      title: "Upper Body",
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

    mockWorkoutServiceMock.putWorkoutStructure.mockResolvedValue({
      ...dtoWorkout,
      ...patch,
    });

    const result = await workoutsMock.putWorkoutStructure("w1", patch);

    expect(mockWorkoutServiceMock.putWorkoutStructure).toHaveBeenCalledWith(
      "w1",
      patch,
    );
    expect(result.title).toBe("Upper Body");
  });

  it("delegates deleteWorkout", async () => {
    mockWorkoutServiceMock.deleteWorkout.mockResolvedValue(true);

    const deleted = await workoutsMock.deleteWorkout("w1");

    expect(mockWorkoutServiceMock.deleteWorkout).toHaveBeenCalledWith("w1");
    expect(deleted).toBe(true);
  });
});
