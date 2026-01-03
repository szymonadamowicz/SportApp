export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTimeSec?: number;
  muscleGroups?: string[];
}

export interface Workout {
  id: string;
  title: string;
  scheduledAt: Date;
  completedAt?: Date;
  exercises: Exercise[];
  muscleGroup?: string;
  notes?: string;
}

export type ExerciseUpdate = Partial<
  Pick<
    Exercise,
    "name" | "sets" | "reps" | "weight" | "muscleGroups" | "restTimeSec"
  >
>;

export interface Tip {
  title: string;
}

export interface Achievement {
  title: string;
  subtitle?: string;
}

export interface Highlights {
  title: string;
  subtitle?: string;
  rightPopup?: string;
}

export type InfoPanelItem = Workout | Tip | Achievement | Highlights;

export type HeroState =
  | {
      kind: "upcoming";
      title: string;
      subtitle?: string;
      timeLabel: string;
      workout: Workout;
    }
  | {
      kind: "missed";
      title: string;
      subtitle: string;
      workout: Workout;
    }
  | {
      kind: "rest";
      title: string;
      subtitle: string;
    };

export interface DraftExercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restTimeSec: string;
  muscleGroups: string;
}

export type UpdateWorkoutPayload = {
  workoutId: string;
  exerciseId: string;
  patch: ExerciseUpdate;
};
