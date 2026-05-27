"use client";

import {
  analyzeExerciseFormApi,
  downloadExerciseFormVideoApi,
} from "@/api/formAnalysis.api";
import { ExerciseFormAnalysisResult } from "@/types/formAnalysis";
import clsx from "clsx";
import {
  Camera,
  RefreshCcw,
  Square,
  UploadCloud,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type WorkoutRunFormAnalysisPanelProps = {
  currentExerciseName?: string;
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

export function WorkoutRunFormAnalysisPanel({
  currentExerciseName,
}: WorkoutRunFormAnalysisPanelProps) {
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

  const canAnalyze = Boolean(recordedBlob) && status !== "analyzing";
  const scoreLabel = useMemo(() => {
    if (!result) return "-";
    return result.score == null ? "No score" : `${result.score}/100`;
  }, [result]);

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

      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
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
        err instanceof Error
          ? err.message
          : "Unable to start camera recording.",
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

      const analysis = await analyzeExerciseFormApi(recordedBlob, exerciseType);
      setResult(analysis);

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
        err instanceof Error
          ? err.message
          : "Unable to analyze this recording.",
      );
    } finally {
      setStatus("idle");
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

        <div className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
          Squat beta
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
              <option value="squat">Squat (current script)</option>
              <option value="other">Other exercise (not supported yet)</option>
            </select>
          </label>

          <div className="overflow-hidden rounded-2xl border border-borderSoft bg-bgHighlight/30">
            {isRecording ? (
              <video
                ref={liveVideoRef}
                autoPlay
                muted
                playsInline
                className="aspect-video w-full object-cover"
              />
            ) : recordedPreviewUrl ? (
              <video
                src={analysisVideoUrl ?? recordedPreviewUrl}
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
              {status === "analyzing" ? "Analyzing..." : "Analyze"}
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

            {result && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
                {result.status.replaceAll("_", " ")}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-textSecondary">
            {result
              ? result.summary
              : "Record a short set, choose the analyzer, then upload it for a first-pass form check."}
          </p>

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

          {result?.findings.length ? (
            <div className="mt-4 space-y-2">
              {result.findings.map((finding) => (
                <div
                  key={finding}
                  className="rounded-xl border border-borderSoft bg-bgCard/40 px-3 py-2 text-sm text-textSecondary"
                >
                  {finding}
                </div>
              ))}
            </div>
          ) : null}

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </div>
      </div>
    </section>
  );
}
