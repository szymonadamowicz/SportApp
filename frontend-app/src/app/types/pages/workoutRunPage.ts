import {
  CompleteWorkoutRunDto,
  WorkoutRunEntryInputDto,
  WorkoutRunStart,
  WorkoutRunStep,
  WorkoutRunSummary,
} from "@/types/workout/workoutRun";

export type WorkoutRunPhase = "exercise" | "rest" | "summary";

export type WorkoutRunPageVM = {
  workoutId: string;
  session: WorkoutRunStart | null;
  currentStep: WorkoutRunStep | null;
  currentStepIndex: number;
  entries: WorkoutRunEntryInputDto[];

  status: "idle" | "starting" | "running" | "saving" | "completed" | "error";
  phase: WorkoutRunPhase;
  secondsLeft: number;
  phaseDuration: number;
  phaseProgress: number;
  elapsedSeconds: number;
  isPaused: boolean;
  showSetPrompt: boolean;

  pendingActualReps: string;
  setPendingActualReps: (value: string) => void;
  pendingMetTarget: boolean;
  setPendingMetTarget: (value: boolean) => void;

  notes: string;
  setNotes: (value: string) => void;
  summary: WorkoutRunSummary | null;
  errorMessage?: string;

  startSession: () => Promise<void>;
  togglePause: () => void;
  handleScreenTap: () => void;
  resumeFromSetPrompt: () => void;
  saveSetAndContinue: () => void;
  skipRest: () => void;
  skipExercise: () => void;
  goToPreviousStep: () => void;
  restartCurrentStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  updateEntry: (
    stepIndex: number,
    patch: { actualReps?: number; metTarget?: boolean },
  ) => void;
  finishSession: () => Promise<void>;
  backToWorkouts: () => void;

  buildCompletionPayload: () => CompleteWorkoutRunDto;
};
