import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { UpdateWorkoutPayload, Exercise } from "@/types/workout/workout";
import { workoutsSeed } from "./workouts.seed";

const db: WorkoutDTO[] = [...workoutsSeed];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const workoutsMockDb = {
  async fetchAll(): Promise<WorkoutDTO[]> {
    await delay(150);
    return [...db];
  },

  async getLastCompleted(): Promise<WorkoutDTO | null> {
    await delay(80);
    const completed = db.filter((w) => w.completedAt);
    if (completed.length === 0) return null;

    completed.sort((a, b) =>
      String(b.completedAt).localeCompare(String(a.completedAt))
    );
    return completed[0];
  },

  async create(workout: WorkoutDTO): Promise<WorkoutDTO> {
    await delay(150);
    const created: WorkoutDTO = {
      ...workout,
      id: workout.id ?? crypto.randomUUID(),
    };
    db.unshift(created);
    return created;
  },

  async patch(workoutId: string, patch: Partial<WorkoutDTO>): Promise<void> {
    await delay(120);
    const idx = db.findIndex((w) => w.id === workoutId);
    if (idx === -1) return;

    db[idx] = { ...db[idx], ...patch };
  },

  async patchByPayload(payload: UpdateWorkoutPayload): Promise<void> {
    await delay(120);

    const workout = db.find((w) => w.id === payload.workoutId);
    if (!workout) return;

    switch (payload.kind) {
      case "workout": {
        Object.assign(workout, payload.patch);
        return;
      }

      case "exercise": {
        workout.exercises = workout.exercises.map((ex) =>
          ex.id === payload.exerciseId ? { ...ex, ...payload.patch } : ex
        );
        return;
      }

      case "createExercise": {
        const toAdd: Exercise[] = payload.exercises.map((ex) => ({
          ...ex,
          id: ex.id ?? crypto.randomUUID(),
        }));

        workout.exercises = [...workout.exercises, ...toAdd];
        return;
      }

      default:
        return;
    }
  },
};
