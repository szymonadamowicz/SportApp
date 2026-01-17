import {
  Workout,
  DraftExercise,
  DraftExerciseValidationError,
} from "../workout/workout";
import { ExerciseDTO } from "../workout/workoutDTO";

export type WorkoutFormVM = {
  now: Date;
  workout: Workout | null;
  editMode: boolean;
  hasChanges: boolean;
  draft: Record<string, DraftExercise>;
  enterEdit: () => void;
  cancelEdit: () => void;
  updateDraft: (exerciseId: string, patch: Partial<DraftExercise>) => void;
  saveAllChanges: () => void;
  editWorkoutAction: () => void;
  enterExercisesEdit: () => void;
  removeExercise: (id: string) => void;
  addExercise: () => void;
  exerciseErrors: Record<string, DraftExerciseValidationError>;
};

export type WorkoutListState = "hasData" | "empty";

export type WorkoutStatus = "completed" | "upcoming" | "missed" | "default";

export interface WorkoutFormProps {
  workout: Workout;
  setEditWorkoutId: (id: string) => void;
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
  onPress?: () => void;
  onAddExercise?: () => void;
  onRemoveExercise?: (id: string) => void;
  errors?: Record<
    string,
    {
      name?: string;
      sets?: string;
      reps?: string;
      weight?: string;
      restTimeSec?: string;
    }
  >;
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
  onSelect: (id: string) => void;
  selectedId?: string;
};

export type CreateWorkoutProps = {
  onCreate: () => void;
};

export type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  editModalId?: string;
};

export type WorkoutCreateErrors = {
  title?: string;
  date?: string;
  time?: string;
  exercises?: string;
  exerciseFields?: Record<string, { sets?: string; reps?: string }>;
};

export type HistorySectionProps = {
  onSelect: (id: string) => void;
  selectedId?: string;
};

export type WorkoutModalVM = {
  mode: "create" | "edit";

  title: string;
  setTitle: (v: string) => void;

  date: string;
  setDate: (v: string) => void;

  time: string;
  setTime: (v: string) => void;

  muscleInput: string;
  setMuscleInput: (v: string) => void;

  selectedMuscles: string[];
  tempSelected: string[];

  dropdownItems: string[];

  dropdownOpen: boolean;
  setDropdownOpen: (v: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;

  toggleTemp: (m: string) => void;
  addCustomMuscle: () => void;
  confirmAddMuscles: () => void;
  removeMuscle: (m: string) => void;

  exercises: ExerciseDTO[];
  addExercise: () => void;
  removeExercise: (id: string) => void;
  updateExercise: (id: string, patch: Partial<ExerciseDTO>) => void;

  errors: WorkoutCreateErrors;
  showToast: boolean;

  createOrUpdateWorkout: () => void;
};

export type useWorkoutModalVMProps = {
  editModalId?: string;
  onClose: () => void;
  open: boolean;
};
