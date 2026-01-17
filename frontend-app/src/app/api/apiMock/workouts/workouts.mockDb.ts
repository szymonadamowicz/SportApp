import { WorkoutDTO } from "@/types/workout/workoutDTO";
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
      String(b.completedAt).localeCompare(String(a.completedAt)),
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

  async update(next: WorkoutDTO): Promise<WorkoutDTO> {
    await delay(120);
    const idx = db.findIndex((w) => w.id === next.id);

    db[idx] = { ...next };
    return db[idx];
  },
};
