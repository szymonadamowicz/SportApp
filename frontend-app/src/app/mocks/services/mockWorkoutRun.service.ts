import { workoutsRepository } from "@/mocks/repositories/workouts.repository";
import { workoutRunsRepository } from "@/mocks/repositories/workoutRuns.repository";
import { getMockLoginFromToken } from "@/contexts/auth/authMock";
import { mockDelay } from "@/mocks/runtime/delay";
import { estimateSetSeconds } from "@/helpers/utils/calculate/workoutRunEstimate";
import { createClientId } from "@/helpers/utils/id/createClientId";
import {
  CompleteWorkoutRunDto,
  SaveWorkoutRunProgressDto,
  WorkoutRunStartDto,
  WorkoutRunStepDto,
  WorkoutRunSummaryDto,
} from "@/types/workout/workoutRun";

const buildSteps = (
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    restTimeSec?: number;
  }[],
): WorkoutRunStepDto[] => {
  const steps: WorkoutRunStepDto[] = [];

  for (const exercise of exercises) {
    const totalSets = Math.max(1, exercise.sets || 1);
    const expectedReps = Math.max(1, exercise.reps || 1);
    const expectedWeight = Math.max(0, exercise.weight || 0);
    const restSeconds = Math.max(15, exercise.restTimeSec || 60);
    const exerciseSeconds = estimateSetSeconds(expectedReps, expectedWeight);

    for (let setNumber = 1; setNumber <= totalSets; setNumber++) {
      steps.push({
        stepIndex: steps.length,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setNumber,
        totalSets,
        expectedReps,
        expectedWeight,
        restSeconds,
        exerciseSeconds,
      });
    }
  }

  return steps;
};

export const mockWorkoutRunService = {
  async getActiveRun(workoutId: string): Promise<WorkoutRunStartDto | null> {
    await mockDelay(90);
    return workoutRunsRepository.getActive(getMockLoginFromToken(), workoutId);
  },

  async getLatestActiveRun(): Promise<WorkoutRunStartDto | null> {
    await mockDelay(90);
    return workoutRunsRepository.getLatestActive(getMockLoginFromToken());
  },

  async startRun(workoutId: string): Promise<WorkoutRunStartDto> {
    await mockDelay(120);
    const ownerLogin = getMockLoginFromToken();

    const activeRun = workoutRunsRepository.getActive(ownerLogin, workoutId);
    if (activeRun) {
      return activeRun;
    }

    const workout = workoutsRepository.getById(workoutId);
    if (!workout) {
      throw new Error(`Workout not found: ${workoutId}`);
    }

    const startDto: WorkoutRunStartDto = {
      runId: createClientId(),
      workoutId: workout.id,
      workoutTitle: workout.title,
      startedAt: new Date().toISOString(),
      isResumed: false,
      nextStepIndex: 0,
      activePhase: "exercise",
      currentStepIndex: 0,
      remainingSeconds: undefined,
      phaseDurationSec: undefined,
      isPaused: false,
      lastProgressAt: undefined,
      durationSec: 0,
      notes: "",
      entries: [],
      steps: buildSteps(workout.exercises),
    };

    return workoutRunsRepository.create(ownerLogin, startDto);
  },

  async saveProgress(
    runId: string,
    payload: SaveWorkoutRunProgressDto,
  ): Promise<WorkoutRunStartDto> {
    await mockDelay(90);
    return workoutRunsRepository.saveProgress(
      getMockLoginFromToken(),
      runId,
      payload,
    );
  },

  async completeRun(
    runId: string,
    payload: CompleteWorkoutRunDto,
  ): Promise<WorkoutRunSummaryDto> {
    await mockDelay(120);

    const summary = workoutRunsRepository.complete(
      getMockLoginFromToken(),
      runId,
      payload,
    );

    workoutsRepository.updateMeta(summary.workoutId, {
      completedAt: summary.finishedAt,
    });

    return summary;
  },

  async cancelRun(runId: string): Promise<void> {
    await mockDelay(90);
    workoutRunsRepository.cancel(getMockLoginFromToken(), runId);
  },
};
