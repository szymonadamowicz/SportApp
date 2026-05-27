import { formAnalysisMock } from "@/api/apiMock/formAnalysis.mock";
import { formAnalysisReal } from "@/api/apiReal/formAnalysis.real";
import { API_MODE } from "@/api/env";
import { ExerciseFormAnalysisKind } from "@/types/formAnalysis";

const impl = API_MODE === "mock" ? formAnalysisMock : formAnalysisReal;

export const analyzeExerciseFormApi = (video: Blob, exerciseType: string) =>
  impl.analyze(video, exerciseType);

export const downloadExerciseFormVideoApi = (
  analysisId: string,
  kind: ExerciseFormAnalysisKind,
) => impl.downloadVideo(analysisId, kind);
