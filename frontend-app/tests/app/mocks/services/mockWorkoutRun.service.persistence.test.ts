import { mockWorkoutRunService } from "@/mocks/services/mockWorkoutRun.service";
import { workoutRunsRepository } from "@/mocks/repositories/workoutRuns.repository";
import { workoutsRepository } from "@/mocks/repositories/workouts.repository";

jest.mock("@/mocks/runtime/delay", () => ({
  mockDelay: jest.fn(() => Promise.resolve()),
}));

describe("mock workout run service - progress persistence", () => {
  beforeEach(() => {
    workoutsRepository.__reset();
    workoutRunsRepository.__reset();
  });

  it("retrieves active run by workout ID", async () => {
    const workout = workoutsRepository.list()[0];

    const run = await mockWorkoutRunService.startRun(workout.id);
    expect(run.runId).toBeTruthy();

    const active = await mockWorkoutRunService.getActiveRun(workout.id);
    expect(active).toBeTruthy();
    expect(active?.runId).toBe(run.runId);
  });

  it("returns null if no active run for workout", async () => {
    const workout = workoutsRepository.list()[0];

    const active = await mockWorkoutRunService.getActiveRun(workout.id);
    expect(active).toBeNull();
  });

  it("saves progress and returns updated session with next step index", async () => {
    const workout = workoutsRepository.list()[0];
    const run = await mockWorkoutRunService.startRun(workout.id);

    const firstStep = run.steps[0];

    const updated = await mockWorkoutRunService.saveProgress(run.runId, {
      durationSec: 65,
      notes: "Solid warm-up",
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

    expect(updated.isResumed).toBe(true);
    expect(updated.nextStepIndex).toBe(1);
    expect(updated.durationSec).toBe(65);
    expect(updated.notes).toBe("Solid warm-up");
    expect(updated.entries).toHaveLength(1);
  });

  it("resume-aware start returns entries and next step when run is already active", async () => {
    const workout = workoutsRepository.list()[0];
    const run = await mockWorkoutRunService.startRun(workout.id);

    const firstStep = run.steps[0];

    await mockWorkoutRunService.saveProgress(run.runId, {
      durationSec: 65,
      notes: "Progress saved",
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

    const resumed = await mockWorkoutRunService.startRun(workout.id);

    expect(resumed.isResumed).toBe(true);
    expect(resumed.nextStepIndex).toBe(1);
    expect(resumed.entries).toHaveLength(1);
    expect(resumed.runId).toBe(run.runId);
  });

  it("marks workout as completed after finishing run", async () => {
    const workout = workoutsRepository.list()[0];
    const run = await mockWorkoutRunService.startRun(workout.id);

    const firstStep = run.steps[0];

    const summary = await mockWorkoutRunService.completeRun(run.runId, {
      durationSec: 240,
      notes: "Completed",
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

    expect(summary.runId).toBe(run.runId);

    const active = await mockWorkoutRunService.getActiveRun(workout.id);
    expect(active).toBeNull();
  });
});
