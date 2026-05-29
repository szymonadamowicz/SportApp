"use client";

import {
  analyzeExerciseFormApi,
  downloadExerciseFormVideoApi,
  listExerciseFormAnalysesApi,
} from "@/api/formAnalysis.api";
import { formAnalysisKeys } from "@/api/keys/formAnalysis.keys";
import { getFriendlyErrorMessage } from "@/api/apiError";
import {
  ExerciseFormAnalysisResult,
  ExerciseFormAnalysisUploadContext,
} from "@/types/formAnalysis";
import { WorkoutRunStep } from "@/types/workout/workoutRun";
import clsx from "clsx";
import {
  AlertTriangle,
  BadgeInfo,
  Camera,
  History,
  PlayCircle,
  RefreshCcw,
  Square,
  UploadCloud,
  Video,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

type WorkoutRunFormAnalysisPanelProps = {
  currentExerciseName?: string;
  workoutRunId?: string;
  workoutId?: string;
  currentStep?: WorkoutRunStep | null;
};

const getRecorderMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

const exerciseAnalyzerLabels: Record<string, string> = {
  squat: "Squat beta",
  bench_press: "Bench press beta",
};
const supportedExerciseTypes = new Set(["squat", "bench_press"]);
const uploadLimitMegabytes = 250;
const maxUploadBytes = uploadLimitMegabytes * 1024 * 1024;

const isFailedAnalysisStatus = (status?: string) =>
  status === "script_failed" || status === "script_not_configured";

const isUnsupportedAnalysisStatus = (status?: string) =>
  status === "unsupported_exercise";

const getAnalysisStatusMeta = (status?: string) => {
  if (isFailedAnalysisStatus(status)) {
    return {
      label: "Analysis failed",
      className: "border-danger/30 bg-danger/10 text-danger",
      panelClassName: "border-danger/30 bg-danger/10 text-danger",
    };
  }

  if (isUnsupportedAnalysisStatus(status)) {
    return {
      label: "Unsupported",
      className: "border-warning/30 bg-warning/10 text-warning",
      panelClassName: "border-warning/30 bg-warning/10 text-warning",
    };
  }

  if (status === "completed") {
    return {
      label: "Completed",
      className: "border-accent/30 bg-accent/10 text-accent",
      panelClassName: "border-accent/30 bg-accent/10 text-accent",
    };
  }

  return {
    label: status ? status.replaceAll("_", " ") : "Beta result",
    className: "border-accentBlue/30 bg-accentBlue/10 text-accentBlue",
    panelClassName: "border-accentBlue/30 bg-accentBlue/10 text-accentBlue",
  };
};

const getResultScoreLabel = (result: ExerciseFormAnalysisResult | null) => {
  if (!result) return "-";
  if (isUnsupportedAnalysisStatus(result.status)) return "Unsupported";
  if (isFailedAnalysisStatus(result.status)) return "Needs retry";
  return result.score == null ? "No score" : `${result.score}/100`;
};

const getDisplaySummary = (result: ExerciseFormAnalysisResult | null) => {
  if (!result) {
    return "Record a short set, choose the analyzer, then upload it for a first-pass form check.";
  }

  if (isFailedAnalysisStatus(result.status)) {
    return "Analysis could not be completed. The recording was saved so you can retry later.";
  }

  return result.summary;
};

const getDisplayFindings = (result: ExerciseFormAnalysisResult | null) => {
  if (!result) return [];

  if (isFailedAnalysisStatus(result.status)) {
    return [
      "Try a shorter, well-lit clip with the full set in frame.",
      "Retry after the analyzer service is checked if the issue repeats.",
    ];
  }

  return result.findings;
};

const formatHistoryTime = (value?: string) => {
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

export function WorkoutRunFormAnalysisPanel({
  currentExerciseName,
  workoutRunId,
  workoutId,
  currentStep,
}: WorkoutRunFormAnalysisPanelProps) {
  const queryClient = useQueryClient();
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedPreviewUrlRef = useRef<string | null>(null);
  const analysisVideoUrlRef = useRef<string | null>(null);

  const [exerciseType, setExerciseType] = useState("squat");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(
    null,
  );
  const [analysisVideoUrl, setAnalysisVideoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ExerciseFormAnalysisResult | null>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "analyzing">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const isSupportedAnalyzer = supportedExerciseTypes.has(exerciseType);
  const canAnalyze =
    Boolean(recordedBlob) && status !== "analyzing" && isSupportedAnalyzer;
  const scoreLabel = useMemo(() => getResultScoreLabel(result), [result]);
  const resultStatusMeta = result ? getAnalysisStatusMeta(result.status) : null;
  const displayFindings = useMemo(() => getDisplayFindings(result), [result]);
  const analysisContext = useMemo<ExerciseFormAnalysisUploadContext>(
    () => ({
      workoutRunId,
      workoutId,
      exerciseId: currentStep?.exerciseId,
      exerciseName: currentStep?.exerciseName ?? currentExerciseName,
      stepIndex: currentStep?.stepIndex,
      setNumber: currentStep?.setNumber,
    }),
    [currentExerciseName, currentStep, workoutId, workoutRunId],
  );
  const historyFilters = useMemo(
    () => ({ workoutRunId, workoutId }),
    [workoutId, workoutRunId],
  );
  const historyKey = formAnalysisKeys.list(historyFilters);
  const historyQuery = useQuery<ExerciseFormAnalysisResult[]>({
    queryKey: historyKey,
    queryFn: () => listExerciseFormAnalysesApi(historyFilters),
    enabled: Boolean(workoutRunId || workoutId),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
  });
  const history = historyQuery.data ?? [];

  useEffect(() => {
    if (!liveVideoRef.current || !streamRef.current) return;
    liveVideoRef.current.srcObject = streamRef.current;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopStream();
      revokeUrl(recordedPreviewUrlRef.current);
      revokeUrl(analysisVideoUrlRef.current);
    };
  }, []);

  const revokeUrl = (url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const replaceRecordedPreviewUrl = (url: string | null) => {
    revokeUrl(recordedPreviewUrlRef.current);
    recordedPreviewUrlRef.current = url;
    setRecordedPreviewUrl(url);
  };

  const replaceAnalysisVideoUrl = (url: string | null) => {
    revokeUrl(analysisVideoUrlRef.current);
    analysisVideoUrlRef.current = url;
    setAnalysisVideoUrl(url);
  };

  const resetRecording = () => {
    replaceRecordedPreviewUrl(null);
    replaceAnalysisVideoUrl(null);
    setRecordedBlob(null);
    setResult(null);
    setError(null);
  };

  const startRecording = async () => {
    try {
      resetRecording();
      setError(null);

      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        setError("Recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      const mimeType = getRecorderMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        replaceRecordedPreviewUrl(url);
        setIsRecording(false);
        setStatus("idle");
        stopStream();
      };

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setStatus("recording");
      recorder.start();
    } catch (err) {
      setError(
        getFriendlyErrorMessage(
          err,
          "Unable to start camera recording. Check camera permissions and try again.",
        ),
      );
      setIsRecording(false);
      setStatus("idle");
      stopStream();
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const analyzeRecording = async () => {
    if (!recordedBlob) return;

    try {
      setStatus("analyzing");
      setError(null);
      setResult(null);

      if (!isSupportedAnalyzer) {
        setError("This beta currently supports squat and bench press analysis only.");
        return;
      }

      if (recordedBlob.size > maxUploadBytes) {
        setError(
          `Recording is too large. Keep analysis videos under ${uploadLimitMegabytes} MB.`,
        );
        return;
      }

      const analysis = await analyzeExerciseFormApi(
        recordedBlob,
        exerciseType,
        analysisContext,
      );
      setResult(analysis);
      queryClient.setQueryData<ExerciseFormAnalysisResult[]>(
        historyKey,
        (prev) =>
          [
            analysis,
            ...(prev ?? []).filter(
              (item) => item.analysisId !== analysis.analysisId,
            ),
          ].slice(0, 20),
      );

      if (analysis.hasAnalyzedVideo) {
        const blob = await downloadExerciseFormVideoApi(
          analysis.analysisId,
          "analyzed",
        );
        const url = URL.createObjectURL(blob);
        replaceAnalysisVideoUrl(url);
      }
    } catch (err) {
      setError(
        getFriendlyErrorMessage(
          err,
          "Unable to analyze this recording. Please try again.",
        ),
      );
    } finally {
      setStatus("idle");
    }
  };

  const loadAnalysisPreview = async (analysis: ExerciseFormAnalysisResult) => {
    try {
      setError(null);
      setResult(analysis);

      const kind = analysis.hasAnalyzedVideo ? "analyzed" : "source";
      if (!analysis.hasAnalyzedVideo && !analysis.hasSourceVideo) return;

      const blob = await downloadExerciseFormVideoApi(analysis.analysisId, kind);
      const url = URL.createObjectURL(blob);
      replaceAnalysisVideoUrl(url);
    } catch (err) {
      setError(
        getFriendlyErrorMessage(
          err,
          "Unable to load this analysis preview. Please try again.",
        ),
      );
    }
  };

  return (
    <section className="rf-animate-panel rounded-2xl border border-borderSoft bg-bgCard/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] md:rounded-xl md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
            Form analysis
          </p>
          <h2 className="mt-1 text-lg font-semibold text-textPrimary">
            Record exercise video
          </h2>
          <p className="mt-1 text-sm text-textSecondary">
            {currentExerciseName
              ? `Current exercise: ${currentExerciseName}`
              : "Attach a short set recording to analyze later."}
          </p>
        </div>

        <div
          className={clsx(
            "rounded-full border px-3 py-1 text-xs font-medium",
            isSupportedAnalyzer
              ? "border-warning/30 bg-warning/10 text-warning"
              : "border-danger/30 bg-danger/10 text-danger",
          )}
        >
          {exerciseAnalyzerLabels[exerciseType] ?? "Unsupported beta"}
        </div>
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl border border-accentBlue/25 bg-accentBlue/10 p-3 text-sm text-textSecondary">
        <BadgeInfo className="mt-0.5 h-4 w-4 shrink-0 text-accentBlue" />
        <div>
          <p className="font-semibold text-textPrimary">Controlled beta</p>
          <p className="mt-1">
            Squat and bench press only. Short single-set clips work best. Upload
            limit is {uploadLimitMegabytes} MB, and old analysis files are
            cleaned up automatically.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-textMuted">
              Exercise analyzer
            </span>
            <select
              value={exerciseType}
              onChange={(event) => setExerciseType(event.target.value)}
              className="rf-input-surface mt-2 min-h-11 w-full rounded-xl px-3 py-2 text-sm"
            >
              <option value="squat">Squat beta</option>
              <option value="bench_press">Bench press beta</option>
              <option value="other">Other exercise (not supported yet)</option>
            </select>
          </label>

          {!isSupportedAnalyzer && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
              Other exercises can be recorded, but this beta will not score them
              yet. Choose squat or bench press to run analysis.
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-borderSoft bg-bgHighlight/30">
            {isRecording ? (
              <video
                ref={liveVideoRef}
                autoPlay
                muted
                playsInline
                className="aspect-video w-full object-cover"
              />
            ) : analysisVideoUrl || recordedPreviewUrl ? (
              <video
                src={analysisVideoUrl ?? recordedPreviewUrl ?? undefined}
                controls
                playsInline
                className="aspect-video w-full bg-black object-contain"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-textMuted">
                <div className="text-center">
                  <Video className="mx-auto h-9 w-9 opacity-70" />
                  <p className="mt-2 text-sm">No recording yet</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-danger/40 bg-danger/12 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/18"
              >
                <Square size={16} />
                Stop recording
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-accentBlue/35 bg-accentBlue/10 px-4 py-2 text-sm font-semibold text-accentBlue transition hover:bg-accentBlue/18"
              >
                <Camera size={16} />
                Record
              </button>
            )}

            <button
              type="button"
              onClick={analyzeRecording}
              disabled={!canAnalyze}
              className={clsx(
                "rf-btn-primary inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                !canAnalyze && "cursor-not-allowed opacity-50",
              )}
            >
              <UploadCloud size={16} />
              {!isSupportedAnalyzer
                ? "Not supported"
                : status === "analyzing"
                  ? "Analyzing..."
                  : "Analyze"}
            </button>

            <button
              type="button"
              onClick={resetRecording}
              disabled={isRecording || (!recordedBlob && !result)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition hover:bg-bgHighlight/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCcw size={15} />
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-borderSoft bg-bgHighlight/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-textMuted">
                Analysis result
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-textPrimary">
                {scoreLabel}
              </p>
            </div>

            {resultStatusMeta && (
              <span
                className={clsx(
                  "rounded-full border px-3 py-1 text-xs",
                  resultStatusMeta.className,
                )}
              >
                {resultStatusMeta.label}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-textSecondary">
            {getDisplaySummary(result)}
          </p>

          {result &&
            (isFailedAnalysisStatus(result.status) ||
              isUnsupportedAnalysisStatus(result.status)) && (
              <div
                className={clsx(
                  "mt-4 flex gap-3 rounded-xl border p-3 text-sm",
                  resultStatusMeta?.panelClassName,
                )}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {isUnsupportedAnalysisStatus(result.status)
                      ? "Analyzer not available for this exercise"
                      : "Analyzer could not finish this clip"}
                  </p>
                  <p className="mt-1 opacity-90">
                    {isUnsupportedAnalysisStatus(result.status)
                      ? "This beta only scores squat and bench press recordings."
                      : "The recording was saved. Try a shorter, well-lit clip or retry after the analyzer service is checked."}
                  </p>
                </div>
              </div>
            )}

          {result?.metrics.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {result.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-borderSoft bg-bgCard/50 px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-textMuted">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-textPrimary">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {displayFindings.length ? (
            <div className="mt-4 space-y-2">
              {displayFindings.map((finding) => (
                <div
                  key={finding}
                  className="rounded-xl border border-borderSoft bg-bgCard/40 px-3 py-2 text-sm text-textSecondary"
                >
                  {finding}
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5 border-t border-borderSoft pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-textMuted">
                <History size={14} />
                Previous analyses
              </div>
              {historyQuery.isFetching && (
                <span className="text-xs text-textMuted">Loading...</span>
              )}
            </div>

            {history.length ? (
              <div className="mt-3 space-y-2">
                {history.slice(0, 5).map((analysis) => {
                  const statusMeta = getAnalysisStatusMeta(analysis.status);

                  return (
                    <button
                      key={analysis.analysisId}
                      type="button"
                      onClick={() => void loadAnalysisPreview(analysis)}
                      className={clsx(
                        "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition hover:border-accent/45 hover:bg-accent/10",
                        result?.analysisId === analysis.analysisId
                          ? "border-accent/45 bg-accent/10"
                          : "border-borderSoft bg-bgCard/35",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-textPrimary">
                          {analysis.exerciseName ??
                            exerciseAnalyzerLabels[analysis.exerciseType] ??
                            "Exercise"}
                        </span>
                        <span className="mt-0.5 block text-xs text-textMuted">
                          {formatHistoryTime(analysis.createdAt)}
                          {analysis.setNumber ? ` - set ${analysis.setNumber}` : ""}
                        </span>
                      </span>
                      <span className="inline-flex shrink-0 flex-col items-end gap-1 text-xs text-textSecondary">
                        <span
                          className={clsx(
                            "rounded-full border px-2 py-0.5",
                            statusMeta.className,
                          )}
                        >
                          {statusMeta.label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {analysis.score == null
                            ? "No score"
                            : `${analysis.score}/100`}
                          <PlayCircle size={14} />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-textMuted">
                No saved analyses for this workout yet.
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex gap-3 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Analysis failed</p>
                <p className="mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
