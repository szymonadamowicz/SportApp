import { mockWorkoutRunService } from "@/mocks/services/mockWorkoutRun.service";
import { workoutRunsRepository } from "@/mocks/repositories/workoutRuns.repository";
import { workoutsRepository } from "@/mocks/repositories/workouts.repository";

jest.mock("@/mocks/runtime/delay", () => ({
  mockDelay: jest.fn(() => Promise.resolve()),
}));

describe("mockWorkoutRunService", () => {
  beforeEach(() => {
    workoutsRepository.__reset();
    workoutRunsRepository.__reset();
  });

  it("starts workout run and builds timed steps", async () => {
    const workout = workoutsRepository.list()[0];

    const run = await mockWorkoutRunService.startRun(workout.id);

    expect(run.workoutId).toBe(workout.id);
    expect(run.steps.length).toBeGreaterThan(0);
    expect(run.steps[0].exerciseName).toBeTruthy();
    expect(run.steps[0].expectedReps).toBeGreaterThan(0);
  });

  it("completes run and marks workout as completed", async () => {
    const workout = workoutsRepository.list()[0];
    const run = await mockWorkoutRunService.startRun(workout.id);

    const firstStep = run.steps[0];

    const summary = await mockWorkoutRunService.completeRun(run.runId, {
      durationSec: 240,
      notes: "Strong session",
      entries: [
        {
          stepIndex: firstStep.stepIndex,
          exerciseId: firstStep.exerciseId,
          exerciseName: firstStep.exerciseName,
          setNumber: firstStep.setNumber,
          expectedReps: firstStep.expectedReps,
          actualReps: firstStep.expectedReps,
          metTarget: true,
          exerciseDurationSec: firstStep.exerciseSeconds,
          restDurationSec: firstStep.restSeconds,
          completedAt: new Date().toISOString(),
        },
      ],
    });

    expect(summary.totalSets).toBe(1);
    expect(summary.metTargetSets).toBe(1);

    const updatedWorkout = workoutsRepository.getById(workout.id);
    expect(updatedWorkout?.completedAt).toBeTruthy();
  });
});
