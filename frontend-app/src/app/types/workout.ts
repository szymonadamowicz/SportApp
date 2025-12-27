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
  Pick<Exercise, "sets" | "reps" | "weight" | "muscleGroups" | "restTimeSec">
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

export type InfoPanelItem = Workout | Tip | Achievement;
export type InfoPanelItems = InfoPanelItem[];

export interface InfoPanelProps {
  title: string;
  items: InfoPanelItems;
  link?: { link: string; label: string };
  desc?: string;
  displayExercises?: boolean;
  progress?: number;
  layout?: "column" | "row";
  maxPerRow?: number;
  dimOthers?: string;
  showButton?: { onClick: (workoutId: string) => void; label: string };
  variant?: "default" | "exercises" | "exercise_edit";
  onUpdateExercise?: (exerciseId: string, changes: ExerciseUpdate) => void;
}

export interface WorkoutFormProps {
  workout?: Workout;
}

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
