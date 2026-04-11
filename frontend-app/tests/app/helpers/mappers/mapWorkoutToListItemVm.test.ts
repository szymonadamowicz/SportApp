import { mapWorkoutToListItemVM } from "@/helpers/mappers/mapWorkoutToListItemVm";
import { Workout } from "@/types/workout/workout";

describe("mapWorkoutToListItemVM", () => {
  it("uses scheduled clock time for missed workouts", () => {
    const now = new Date("2026-04-03T12:00:00.000Z");
    const workout: Workout = {
      id: "w1",
      title: "Morning run",
      scheduledAt: new Date("2026-04-03T09:14:00.000Z"),
      exercises: [],
    };

    const vm = mapWorkoutToListItemVM(workout, now);

    expect(vm.status).toBe("missed");
    expect(vm.timeLabel).not.toBe("missed");
    expect(vm.timeLabel).toMatch(/\d{1,2}:\d{2}/);
  });

  it("keeps relative label for upcoming workouts", () => {
    const now = new Date("2026-04-03T12:00:00.000Z");
    const workout: Workout = {
      id: "w2",
      title: "Evening lift",
      scheduledAt: new Date("2026-04-04T12:00:00.000Z"),
      exercises: [],
    };

    const vm = mapWorkoutToListItemVM(workout, now);

    expect(vm.status).toBe("upcoming");
    expect(vm.timeLabel.startsWith("in ")).toBe(true);
  });

  it("treats workout with completedAt as completed", () => {
    const now = new Date("2026-04-03T12:00:00.000Z");
    const workout: Workout = {
      id: "w3",
      title: "Late sync",
      scheduledAt: new Date("2026-04-03T09:14:00.000Z"),
      completedAt: new Date("2026-04-04T09:14:00.000Z"),
      exercises: [],
    };

    const vm = mapWorkoutToListItemVM(workout, now);

    expect(vm.status).toBe("completed");
    expect(vm.timeLabel).not.toBe("missed");
  });
});
