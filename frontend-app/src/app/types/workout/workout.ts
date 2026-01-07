import { WorkoutDTO } from "./workoutDTO";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTimeSec?: number;
}

export interface Workout {
  id: string;
  title: string;
  scheduledAt: Date;
  completedAt?: Date;
  exercises: Exercise[];
  muscleGroups?: string[];
  mainFocus?: string;
}

export type ExerciseUpdate = Partial<
  Pick<Exercise, "name" |"sets" | "reps" | "weight" | "restTimeSec">
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
}

export type UpdateWorkoutPayload = {
  workoutId: string;
  exerciseId: string;
  patch: ExerciseUpdate;
};
export type CreateWorkoutPayload = {
  workout: WorkoutDTO;
};
