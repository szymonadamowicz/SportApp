import { API_BASE_URL } from "@/api/env";
import {
  createApiErrorFromResponse,
  createNetworkError,
} from "@/api/apiError";
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

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/form-analyses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
    } catch {
      throw createNetworkError("Could not upload the recording. Check your connection and try again.");
    }

    const text = await response.text();
    if (!response.ok) {
      throw createApiErrorFromResponse(
        response,
        text,
        "Could not analyze this recording. Please try again.",
      );
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

    let response: Response;
    try {
      response = await fetch(
        `${API_BASE_URL}/form-analyses${params.size ? `?${params}` : ""}`,
        {
          headers: getAuthHeaders(),
        },
      );
    } catch {
      throw createNetworkError("Could not load form analyses. Check your connection and try again.");
    }

    const text = await response.text();
    if (!response.ok) {
      throw createApiErrorFromResponse(
        response,
        text,
        "Could not load form analyses. Please try again.",
      );
    }

    return JSON.parse(text) as ExerciseFormAnalysisResult[];
  },

  async get(analysisId: string): Promise<ExerciseFormAnalysisResult> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/form-analyses/${analysisId}`, {
        headers: getAuthHeaders(),
      });
    } catch {
      throw createNetworkError("Could not load this analysis. Check your connection and try again.");
    }

    const text = await response.text();
    if (!response.ok) {
      throw createApiErrorFromResponse(
        response,
        text,
        "Could not load this analysis. Please try again.",
      );
    }

    return JSON.parse(text) as ExerciseFormAnalysisResult;
  },

  async downloadVideo(
    analysisId: string,
    kind: ExerciseFormAnalysisKind,
  ): Promise<Blob> {
    let response: Response;
    try {
      response = await fetch(
        `${API_BASE_URL}/form-analyses/${analysisId}/video?kind=${kind}`,
        {
          headers: getAuthHeaders(),
        },
      );
    } catch {
      throw createNetworkError("Could not load the video preview. Check your connection and try again.");
    }

    if (!response.ok) {
      const text = await response.text();
      throw createApiErrorFromResponse(
        response,
        text,
        "Video preview is unavailable. Please try again.",
      );
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
