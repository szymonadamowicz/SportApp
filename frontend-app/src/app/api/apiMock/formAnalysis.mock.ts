import {
  ExerciseFormAnalysisKind,
  ExerciseFormAnalysisResult,
} from "@/types/formAnalysis";

export const formAnalysisMock = {
  async analyze(
    _video: Blob,
    exerciseType: string,
  ): Promise<ExerciseFormAnalysisResult> {
    return {
      analysisId: crypto.randomUUID(),
      exerciseType,
      status: exerciseType === "squat" ? "completed" : "unsupported_exercise",
      score: exerciseType === "squat" ? 72 : null,
      summary:
        exerciseType === "squat"
          ? "Mock squat analysis completed. This is a local preview result."
          : "Only squat is supported by the current analyzer.",
      findings:
        exerciseType === "squat"
          ? [
              "Depth looks acceptable in this mock result.",
              "Knee tracking looks stable enough for a first pass.",
            ]
          : ["Choose squat to use the current analysis flow."],
      metrics: [
        { label: "Mode", value: "Mock" },
        { label: "Exercise", value: exerciseType },
      ],
      hasSourceVideo: true,
      hasAnalyzedVideo: false,
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
