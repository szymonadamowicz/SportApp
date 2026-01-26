import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { workoutsSeed } from "./workouts.seed";
import { FeedbackValue } from "@/types/pages/progressPage";

const db: WorkoutDTO[] = [...workoutsSeed];
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const requireIdx = (id: string) => {
  const idx = db.findIndex((w) => w.id === id);
  if (idx === -1) throw new Error(`Workout not found: ${id}`);
  return idx;
};

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

  async patchMeta(
    id: string,
    dto: {
      scheduledAt?: string | null;
      completedAt?: string | null;
      perceivedLoad?: FeedbackValue;
    },
  ): Promise<WorkoutDTO> {
    await delay(100);
    const idx = requireIdx(id);

    db[idx] = {
      ...db[idx],
      scheduledAt: dto.scheduledAt ?? db[idx].scheduledAt,
      completedAt: dto.completedAt ?? db[idx].completedAt,
      perceivedLoad:
        dto.perceivedLoad !== undefined
          ? dto.perceivedLoad
          : db[idx].perceivedLoad,
    };

    return { ...db[idx] };
  },

  async putStructure(
    id: string,
    dto: { title: string; exercises: WorkoutDTO["exercises"] },
  ): Promise<WorkoutDTO> {
    await delay(120);
    const idx = requireIdx(id);

    db[idx] = {
      ...db[idx],
      title: dto.title,
      exercises: dto.exercises,
    };

    return { ...db[idx] };
  },
};
