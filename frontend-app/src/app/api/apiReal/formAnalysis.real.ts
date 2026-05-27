import { API_BASE_URL } from "@/api/env";
import { authStorage } from "@/contexts/auth/authStorage";
import {
  ExerciseFormAnalysisKind,
  ExerciseFormAnalysisResult,
} from "@/types/formAnalysis";

const getAuthHeaders = (): HeadersInit | undefined => {
  const token = authStorage.read()?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const formAnalysisReal = {
  async analyze(
    video: Blob,
    exerciseType: string,
  ): Promise<ExerciseFormAnalysisResult> {
    const formData = new FormData();
    formData.append("video", video, `exercise-${Date.now()}.webm`);
    formData.append("exerciseType", exerciseType);

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
