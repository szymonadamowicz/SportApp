import { workoutsFixture } from "@/mocks/fixtures/workouts.fixture";
import { deepClone } from "@/mocks/runtime/clone";
import { UpdateWorkoutStructureDto } from "@/types/workout/workoutApi";
import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { FeedbackValue } from "@/types/pages/progressPage";

let state: WorkoutDTO[] = deepClone(workoutsFixture);

const requireIndex = (id: string) => {
  const index = state.findIndex((workout) => workout.id === id);
  if (index === -1) {
    throw new Error(`Workout not found: ${id}`);
  }
  return index;
};

export const workoutsRepository = {
  list(): WorkoutDTO[] {
    return deepClone(state);
  },

  getById(id: string): WorkoutDTO | null {
    const workout = state.find((entry) => entry.id === id);
    return workout ? deepClone(workout) : null;
  },

  getLastCompleted(): WorkoutDTO | null {
    const completed = state.filter((workout) => workout.completedAt);
    if (completed.length === 0) return null;

    completed.sort((a, b) =>
      String(b.completedAt).localeCompare(String(a.completedAt)),
    );

    return deepClone(completed[0]);
  },

  create(workout: WorkoutDTO): WorkoutDTO {
    const created: WorkoutDTO = {
      ...workout,
      id: workout.id ?? crypto.randomUUID(),
    };

    state.unshift(created);
    return deepClone(created);
  },

  updateMeta(
    id: string,
    patch: {
      scheduledAt?: string | null;
      completedAt?: string | null;
      perceivedLoad?: FeedbackValue;
    },
  ): WorkoutDTO {
    const index = requireIndex(id);
    const hasScheduledAt = Object.prototype.hasOwnProperty.call(
      patch,
      "scheduledAt",
    );
    const hasCompletedAt = Object.prototype.hasOwnProperty.call(
      patch,
      "completedAt",
    );

    state[index] = {
      ...state[index],
      scheduledAt:
        hasScheduledAt && patch.scheduledAt
          ? patch.scheduledAt
          : state[index].scheduledAt,
      completedAt: hasCompletedAt
        ? patch.completedAt
        : state[index].completedAt,
      perceivedLoad:
        patch.perceivedLoad !== undefined
          ? patch.perceivedLoad
          : state[index].perceivedLoad,
    };

    return deepClone(state[index]);
  },

  updateStructure(id: string, patch: UpdateWorkoutStructureDto): WorkoutDTO {
    const index = requireIndex(id);

    state[index] = {
      ...state[index],
      title: patch.title,
      muscleGroups: patch.muscleGroups ?? state[index].muscleGroups,
      mainFocus:
        patch.muscleGroups !== undefined
          ? patch.muscleGroups[0]
          : state[index].mainFocus,
      exercises: patch.exercises,
    };

    return deepClone(state[index]);
  },

  delete(id: string): boolean {
    const index = state.findIndex((workout) => workout.id === id);
    if (index === -1) return false;

    state.splice(index, 1);
    return true;
  },

  __reset(): void {
    state = deepClone(workoutsFixture);
  },
};
