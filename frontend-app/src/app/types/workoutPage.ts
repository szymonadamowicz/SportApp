import { Workout, DraftExercise } from "./workout";

export type WorkoutFormVM = {
  workout: Workout | null;
  editMode: boolean;
  hasChanges: boolean;
  draft: Record<string, DraftExercise>;
  enterEdit: () => void;
  cancelEdit: () => void;
  updateDraft: (exerciseId: string, patch: Partial<DraftExercise>) => void;
  saveAllChanges: () => void;
};

export type WorkoutListState = "hasData" | "empty";

export type WorkoutStatus = "completed" | "upcoming" | "missed" | "default";

export interface WorkoutFormProps {
  workout: Workout;
}

export type ExerciseEditProps = {
  draft: Record<string, DraftExercise>;
  onDraftChange: (exerciseId: string, patch: Partial<DraftExercise>) => void;
  onCommit: (exerciseId: string) => void;
};

export interface WorkoutListItemProps {
  item: WorkoutListItemVM;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}

export interface WorkoutListSectionProps {
  item: WorkoutListItemVM[];
  selectedId?: string;
  title: string;
  seeAllLabel: string;
  onToggleSeeAll: () => void;
  onSelect: (id: string) => void;
}

export interface WorkoutExercisesSectionProps {
  workout: Workout;
  editMode: boolean;
  draft: Record<string, DraftExercise>;
  onDraftChange: (id: string, patch: Partial<DraftExercise>) => void;
}

export interface WorkoutListItemVM {
  id: string;
  title: string;
  muscleGroup?: string;
  status: WorkoutStatus;
  timeLabel: string;
  dayLabel?: string;
}

export type ValueWithUnitProps = {
  value?: string | number;
  unit: string;
};
