import { formAnalysisMock } from "@/api/apiMock/formAnalysis.mock";
import { formAnalysisReal } from "@/api/apiReal/formAnalysis.real";
import { API_MODE } from "@/api/env";
import {
  ExerciseFormAnalysisKind,
  ExerciseFormAnalysisListFilters,
  ExerciseFormAnalysisUploadContext,
} from "@/types/formAnalysis";

const impl = API_MODE === "mock" ? formAnalysisMock : formAnalysisReal;

export const analyzeExerciseFormApi = (
  video: Blob,
  exerciseType: string,
  context?: ExerciseFormAnalysisUploadContext,
) => impl.analyze(video, exerciseType, context);

export const listExerciseFormAnalysesApi = (
  filters?: ExerciseFormAnalysisListFilters,
) => impl.list(filters);

export const getExerciseFormAnalysisApi = (analysisId: string) =>
  impl.get(analysisId);

export const downloadExerciseFormVideoApi = (
  analysisId: string,
  kind: ExerciseFormAnalysisKind,
) => impl.downloadVideo(analysisId, kind);
