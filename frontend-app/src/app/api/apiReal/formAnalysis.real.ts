import { API_BASE_URL } from "@/api/env";
import { authStorage } from "@/contexts/auth/authStorage";
import {
  ExerciseFormAnalysisKind,
  ExerciseFormAnalysisListFilters,
  ExerciseFormAnalysisResult,
  ExerciseFormAnalysisUploadContext,
} from "@/types/formAnalysis";

const getAuthHeaders = (): HeadersInit | undefined => {
  const token = authStorage.read()?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const formAnalysisReal = {
  async analyze(
    video: Blob,
    exerciseType: string,
    context?: ExerciseFormAnalysisUploadContext,
  ): Promise<ExerciseFormAnalysisResult> {
    const formData = new FormData();
    formData.append("video", video, `exercise-${Date.now()}.webm`);
    formData.append("exerciseType", exerciseType);
    appendOptional(formData, "workoutRunId", context?.workoutRunId);
    appendOptional(formData, "workoutId", context?.workoutId);
    appendOptional(formData, "exerciseId", context?.exerciseId);
    appendOptional(formData, "exerciseName", context?.exerciseName);
    appendOptional(formData, "stepIndex", context?.stepIndex);
    appendOptional(formData, "setNumber", context?.setNumber);

    const response = await fetch(`${API_BASE_URL}/form-analyses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text.trim() || `HTTP ${response.status}: Request failed.`);
    }

    return JSON.parse(text) as ExerciseFormAnalysisResult;
  },

  async list(
    filters?: ExerciseFormAnalysisListFilters,
  ): Promise<ExerciseFormAnalysisResult[]> {
    const params = new URLSearchParams();
    if (filters?.workoutRunId) {
      params.set("workoutRunId", filters.workoutRunId);
    }
    if (filters?.workoutId) {
      params.set("workoutId", filters.workoutId);
    }

    const response = await fetch(
      `${API_BASE_URL}/form-analyses${params.size ? `?${params}` : ""}`,
      {
        headers: getAuthHeaders(),
      },
    );

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text.trim() || `HTTP ${response.status}: Request failed.`);
    }

    return JSON.parse(text) as ExerciseFormAnalysisResult[];
  },

  async get(analysisId: string): Promise<ExerciseFormAnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/form-analyses/${analysisId}`, {
      headers: getAuthHeaders(),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text.trim() || `HTTP ${response.status}: Request failed.`);
    }

    return JSON.parse(text) as ExerciseFormAnalysisResult;
  },

  async downloadVideo(
    analysisId: string,
    kind: ExerciseFormAnalysisKind,
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/form-analyses/${analysisId}/video?kind=${kind}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Video preview unavailable.`);
    }

    return response.blob();
  },
};

const appendOptional = (
  formData: FormData,
  key: string,
  value: string | number | undefined | null,
) => {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
};
