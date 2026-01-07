import { Workout, DraftExercise } from "../workout/workout";

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
  listState: WorkoutListState;
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
  muscleGroups?: string[];
  mainFocus?: string;
  status: WorkoutStatus;
  timeLabel: string;
  dayLabel?: string;
  dateLabel?: string;
}

export type ValueWithUnitProps = {
  value?: string | number;
  unit: string;
};

export type WorkoutHistorySectionProps = {
  title: string;
  items: WorkoutListItemVM[];
  empty?: {
    icon: string;
    title: string;
    description?: string;
  };
  outerButton?: {
    label: string;
    onClick: () => void;
  };
};

export type CreateWorkoutProps = {
  onCreate: () => void;
};

export type CreateModalProps = {
  open: boolean;
  onClose: () => void;
};

export type WorkoutCreateErrors = {
  title?: string;
  date?: string;
  time?: string;
  exercises?: string;
  exerciseFields?: Record<string, { sets?: string; reps?: string }>;
};
