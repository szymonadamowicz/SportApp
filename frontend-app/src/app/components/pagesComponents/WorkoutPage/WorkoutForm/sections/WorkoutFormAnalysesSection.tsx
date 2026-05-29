"use client";

import {
  downloadExerciseFormVideoApi,
  listExerciseFormAnalysesApi,
} from "@/api/formAnalysis.api";
import { formAnalysisKeys } from "@/api/keys/formAnalysis.keys";
import { getFriendlyErrorMessage } from "@/api/apiError";
import {
  ExerciseFormAnalysisKind,
  ExerciseFormAnalysisResult,
} from "@/types/formAnalysis";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { AlertTriangle, History, PlayCircle, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type WorkoutFormAnalysesSectionProps = {
  workoutId: string;
};

const isProcessingAnalysisStatus = (status?: string) => status === "processing";

const getStatusClass = (status?: string) => {
  if (status === "completed") {
    return "border-accent/30 bg-accent/10 text-accent";
  }

  if (status === "processing") {
    return "border-accentBlue/30 bg-accentBlue/10 text-accentBlue";
  }

  if (status === "unsupported_exercise") {
    return "border-warning/30 bg-warning/10 text-warning";
  }

  if (status === "script_failed" || status === "script_not_configured") {
    return "border-danger/30 bg-danger/10 text-danger";
  }

  return "border-borderSoft bg-bgHighlight/40 text-textSecondary";
};

const getStatusLabel = (status?: string) => {
  if (!status) return "Analysis";
  return status.replaceAll("_", " ");
};

const formatAnalysisTime = (value?: string) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function WorkoutFormAnalysesSection({
  workoutId,
}: WorkoutFormAnalysesSectionProps) {
  const videoUrlRef = useRef<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<ExerciseFormAnalysisResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);

  const filters = useMemo(() => ({ workoutId }), [workoutId]);
  const query = useQuery<ExerciseFormAnalysisResult[]>({
    queryKey: formAnalysisKeys.list(filters),
    queryFn: () => listExerciseFormAnalysesApi(filters),
    enabled: Boolean(workoutId),
    refetchOnMount: "always",
    staleTime: 30 * 1000,
    refetchInterval: (result) => {
      const data = result.state.data as ExerciseFormAnalysisResult[] | undefined;
      return data?.some((analysis) => isProcessingAnalysisStatus(analysis.status))
        ? 5000
        : false;
    },
  });

  const analyses = (query.data ?? []).slice(0, 3);

  useEffect(() => {
    if (!selectedAnalysis) return;

    const updatedAnalysis = analyses.find(
      (analysis) => analysis.analysisId === selectedAnalysis.analysisId,
    );

    if (updatedAnalysis && updatedAnalysis !== selectedAnalysis) {
      setSelectedAnalysis(updatedAnalysis);
    }
  }, [analyses, selectedAnalysis]);

  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  const replaceVideoUrl = (url: string | null) => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
    }

    videoUrlRef.current = url;
    setVideoUrl(url);
  };

  const loadPreview = async (analysis: ExerciseFormAnalysisResult) => {
    setSelectedAnalysis(analysis);
    setPreviewError(null);
    replaceVideoUrl(null);

    if (!analysis.hasAnalyzedVideo && !analysis.hasSourceVideo) {
      return;
    }

    const kind: ExerciseFormAnalysisKind = analysis.hasAnalyzedVideo
      ? "analyzed"
      : "source";

    try {
      setLoadingPreviewId(analysis.analysisId);
      const blob = await downloadExerciseFormVideoApi(analysis.analysisId, kind);
      replaceVideoUrl(URL.createObjectURL(blob));
    } catch (error) {
      setPreviewError(
        getFriendlyErrorMessage(
          error,
          "Could not load this analysis video. Please try again.",
        ),
      );
    } finally {
      setLoadingPreviewId(null);
    }
  };

  if (!query.isLoading && analyses.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 rounded-2xl border border-borderSoft bg-bgHighlight/20 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-textMuted">
            <History size={14} />
            Form analyses
          </div>
          <p className="mt-1 text-sm text-textSecondary">
            Latest saved checks for this workout
          </p>
        </div>

        {query.isFetching && (
          <span className="text-xs text-textMuted">Refreshing...</span>
        )}
      </div>

      {query.isLoading ? (
        <p className="mt-3 text-sm text-textMuted">Loading analyses...</p>
      ) : (
        <div className="mt-3 grid gap-2 lg:grid-cols-3">
          {analyses.map((analysis) => (
            <button
              key={analysis.analysisId}
              type="button"
              onClick={() => void loadPreview(analysis)}
              className={clsx(
                "min-h-24 rounded-xl border px-3 py-3 text-left transition hover:border-accent/45 hover:bg-accent/10",
                selectedAnalysis?.analysisId === analysis.analysisId
                  ? "border-accent/45 bg-accent/10"
                  : "border-borderSoft bg-bgCard/35",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-textPrimary">
                    {analysis.exerciseName ?? "Exercise"}
                  </span>
                  <span className="mt-1 block text-xs text-textMuted">
                    {formatAnalysisTime(analysis.createdAt)}
                    {analysis.setNumber ? ` - set ${analysis.setNumber}` : ""}
                  </span>
                </span>

                <span
                  className={clsx(
                    "shrink-0 rounded-full border px-2 py-0.5 text-xs capitalize",
                    getStatusClass(analysis.status),
                  )}
                >
                  {getStatusLabel(analysis.status)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-textSecondary">
                <span>
                  {analysis.score == null ? "No score" : `${analysis.score}/100`}
                </span>
                <span className="inline-flex items-center gap-1">
                  {loadingPreviewId === analysis.analysisId
                    ? "Loading..."
                    : "Preview"}
                  <PlayCircle size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedAnalysis && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
          <div className="overflow-hidden rounded-2xl border border-borderSoft bg-black">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                playsInline
                className="aspect-video w-full object-contain"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-textMuted">
                <div className="text-center">
                  <Video className="mx-auto h-8 w-8 opacity-70" />
                  <p className="mt-2 text-sm">
                    {loadingPreviewId ? "Loading video..." : "No video preview"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-borderSoft bg-bgCard/50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-textMuted">
                  Analysis result
                </p>
                <p className="mt-1 text-2xl font-semibold text-textPrimary">
                  {selectedAnalysis.score == null
                    ? "-"
                    : `${selectedAnalysis.score}/100`}
                </p>
              </div>

              <span
                className={clsx(
                  "rounded-full border px-2 py-0.5 text-xs capitalize",
                  getStatusClass(selectedAnalysis.status),
                )}
              >
                {getStatusLabel(selectedAnalysis.status)}
              </span>
            </div>

            <p className="mt-3 text-sm text-textSecondary">
              {selectedAnalysis.summary}
            </p>

            {selectedAnalysis.findings.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedAnalysis.findings.slice(0, 3).map((finding) => (
                  <div
                    key={finding}
                    className="rounded-xl border border-borderSoft bg-bgHighlight/30 px-3 py-2 text-sm text-textSecondary"
                  >
                    {finding}
                  </div>
                ))}
              </div>
            )}

            {previewError && (
              <div className="mt-3 flex gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{previewError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
