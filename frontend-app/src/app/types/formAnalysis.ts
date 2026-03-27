export type ExerciseFormAnalysisMetric = {
  label: string;
  value: string;
};

export type ExerciseFormAnalysisResult = {
  analysisId: string;
  workoutRunId?: string | null;
  workoutId?: string | null;
  exerciseId?: string | null;
  exerciseName?: string | null;
  exerciseType: string;
  stepIndex?: number | null;
  setNumber?: number | null;
  status: string;
  score?: number | null;
  summary: string;
  findings: string[];
  metrics: ExerciseFormAnalysisMetric[];
  hasSourceVideo: boolean;
  hasAnalyzedVideo: boolean;
  analyzerVersion?: string;
  modelName?: string | null;
  createdAt?: string;
  completedAt?: string | null;
};

export type ExerciseFormAnalysisKind = "source" | "analyzed";

export type ExerciseFormAnalysisUploadContext = {
  workoutRunId?: string;
  workoutId?: string;
  exerciseId?: string;
  exerciseName?: string;
  stepIndex?: number;
  setNumber?: number;
};

export type ExerciseFormAnalysisListFilters = {
  workoutRunId?: string;
  workoutId?: string;
};
