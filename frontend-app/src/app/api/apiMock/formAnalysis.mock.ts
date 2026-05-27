import {
  ExerciseFormAnalysisKind,
  ExerciseFormAnalysisListFilters,
  ExerciseFormAnalysisResult,
  ExerciseFormAnalysisUploadContext,
} from "@/types/formAnalysis";

export const formAnalysisMock = {
  async analyze(
    _video: Blob,
    exerciseType: string,
    context?: ExerciseFormAnalysisUploadContext,
  ): Promise<ExerciseFormAnalysisResult> {
    const isSquat = exerciseType === "squat";
    const isBenchPress = exerciseType === "bench_press";

    return {
      analysisId: crypto.randomUUID(),
      workoutRunId: context?.workoutRunId ?? null,
      workoutId: context?.workoutId ?? null,
      exerciseId: context?.exerciseId ?? null,
      exerciseName: context?.exerciseName ?? null,
      exerciseType,
      stepIndex: context?.stepIndex ?? null,
      setNumber: context?.setNumber ?? null,
      status: isSquat || isBenchPress ? "completed" : "unsupported_exercise",
      score: isSquat ? 72 : isBenchPress ? 68 : null,
      summary:
        isSquat
          ? "Mock squat analysis completed. This is a local preview result."
          : isBenchPress
            ? "Mock bench press analysis completed. Elbow range and full rep checks are simulated."
            : "Only squat and bench press are supported by the current analyzer.",
      findings:
        isSquat
          ? [
              "Depth looks acceptable in this mock result.",
              "Knee tracking looks stable enough for a first pass.",
            ]
          : isBenchPress
            ? [
                "Movement looks full in this mock result.",
                "Elbow range returns close to extension.",
                "Wrist stays reasonably stacked over the elbow.",
              ]
            : ["Choose squat or bench press to use the current analysis flow."],
      metrics: [
        { label: "Mode", value: "Mock" },
        { label: "Exercise", value: exerciseType },
        ...(isBenchPress
          ? [
              { label: "Full movement", value: "Yes" },
              { label: "Elbow range", value: "62 deg" },
            ]
          : []),
      ],
      hasSourceVideo: true,
      hasAnalyzedVideo: false,
      analyzerVersion: "mock-form-analysis-v1",
      modelName: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  },

  async list(
    filters?: ExerciseFormAnalysisListFilters,
  ): Promise<ExerciseFormAnalysisResult[]> {
    void filters;

    return [];
  },

  async get(analysisId: string): Promise<ExerciseFormAnalysisResult> {
    return {
      analysisId,
      exerciseType: "squat",
      status: "completed",
      score: 72,
      summary: "Mock analysis loaded from history.",
      findings: ["Depth looks acceptable in this mock result."],
      metrics: [{ label: "Mode", value: "Mock" }],
      hasSourceVideo: true,
      hasAnalyzedVideo: false,
      analyzerVersion: "mock-form-analysis-v1",
      modelName: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  },

  async downloadVideo(
    analysisId: string,
    kind: ExerciseFormAnalysisKind,
  ): Promise<Blob> {
    void analysisId;
    void kind;

    throw new Error("Mock analyzed video is not available.");
  },
};
