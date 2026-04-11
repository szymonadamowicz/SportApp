import { workoutsRepository } from "@/mocks/repositories/workouts.repository";
import { WorkoutDTO } from "@/types/workout/workoutDTO";

const createWorkout = (overrides: Partial<WorkoutDTO> = {}): WorkoutDTO => ({
  id: "w-new",
  title: "New Workout",
  scheduledAt: "2026-04-03T10:00:00.000Z",
  completedAt: null,
  exercises: [
    {
      id: "e-1",
      name: "Squat",
      sets: 3,
      reps: 8,
      weight: 100,
    },
  ],
  ...overrides,
});

describe("workoutsRepository", () => {
  beforeEach(() => {
    workoutsRepository.__reset();
  });

  it("returns cloned list so external mutations do not change state", () => {
    const list = workoutsRepository.list();
    list[0].title = "Mutated";

    const nextRead = workoutsRepository.list();

    expect(nextRead[0].title).not.toBe("Mutated");
  });

  it("returns latest completed workout", () => {
    const lastCompleted = workoutsRepository.getLastCompleted();

    expect(lastCompleted).not.toBeNull();
    expect(lastCompleted?.completedAt).toBeTruthy();
  });

  it("creates workout and prepends it to list", () => {
    const created = workoutsRepository.create(createWorkout());
    const list = workoutsRepository.list();

    expect(created.id).toBe("w-new");
    expect(list[0].id).toBe("w-new");
  });

  it("updates workout meta", () => {
    const target = workoutsRepository.list()[0];

    const updated = workoutsRepository.updateMeta(target.id, {
      completedAt: "2026-04-03T12:00:00.000Z",
      perceivedLoad: "balanced",
    });

    expect(updated.completedAt).toBe("2026-04-03T12:00:00.000Z");
    expect(updated.perceivedLoad).toBe("balanced");
  });

  it("throws on meta update for missing workout", () => {
    expect(() =>
      workoutsRepository.updateMeta("missing", {
        completedAt: "2026-04-03T12:00:00.000Z",
      }),
    ).toThrow("Workout not found: missing");
  });

  it("updates workout structure", () => {
    const target = workoutsRepository.list()[0];

    const updated = workoutsRepository.updateStructure(target.id, {
      title: "Updated Title",
      muscleGroups: ["back", "arms"],
      exercises: [{ id: "e2", name: "Bench", sets: 4, reps: 6, weight: 90 }],
    });

    expect(updated.title).toBe("Updated Title");
    expect(updated.muscleGroups).toEqual(["back", "arms"]);
    expect(updated.mainFocus).toBe("back");
    expect(updated.exercises).toHaveLength(1);
    expect(updated.exercises[0].name).toBe("Bench");
  });

  it("clears mainFocus when muscle groups are cleared", () => {
    const target = workoutsRepository.list()[0];

    const updated = workoutsRepository.updateStructure(target.id, {
      title: "Updated Title",
      muscleGroups: [],
      exercises: target.exercises,
    });

    expect(updated.muscleGroups).toEqual([]);
    expect(updated.mainFocus).toBeUndefined();
  });

  it("deletes workout and returns false for missing id", () => {
    const existingId = workoutsRepository.list()[0].id;

    const deleted = workoutsRepository.delete(existingId);
    const deletedMissing = workoutsRepository.delete("missing");

    expect(deleted).toBe(true);
    expect(deletedMissing).toBe(false);
  });
});
