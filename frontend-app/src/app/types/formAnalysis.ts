export type ExerciseFormAnalysisMetric = {
  label: string;
  value: string;
};

export type ExerciseFormAnalysisResult = {
  analysisId: string;
  exerciseType: string;
  status: string;
  score?: number | null;
  summary: string;
  findings: string[];
  metrics: ExerciseFormAnalysisMetric[];
  hasSourceVideo: boolean;
  hasAnalyzedVideo: boolean;
};

export type ExerciseFormAnalysisKind = "source" | "analyzed";
