import {
  getInfoAchievementProgressItems,
  getPRAchievementProgressItems,
} from "@/helpers/utils/selectors/progress/progressSelector";
import { useProgressAchievements } from "@/hooks/apiHooks/progress/useProgressAchievements";
import { useLastCompletedWorkout } from "@/hooks/apiHooks/workouts/useLastCompletedWorkout";
import { usePatchWorkoutMeta } from "@/hooks/apiHooks/workouts/usePatchWorkoutMeta";
import {
  ProgressQualityTipItemProps,
  ProgressLastSessionFeedbackKind,
  ProgressLastSessionFeedback,
  ProgressStatCardProps,
  ProgressPRListItemProps,
  ProgressLastSessionView,
  FeedbackValue,
} from "@/types/pages/progressPage";
import { ProgressAchievements } from "@/types/progress/progress";
import { useCallback, useMemo, useState } from "react";

export const useProgressPageVM = () => {
  const {
    achievements,
    allProgress,
    isLoading: isLoadingAchievements,
    isError: isErrorAchievements,
  } = useProgressAchievements();
  const {
    lastCompletedWorkout,
    isLoading: isLoadingLastWorkout,
    isError: isErrorLastWorkout,
  } = useLastCompletedWorkout();

  const updateWorkout = usePatchWorkoutMeta();

  const [showWeek, setShowWeek] = useState(false);
  const [prevFeedbackState, setPrevFeedbackState] =
    useState<ProgressLastSessionFeedbackKind>(
      ProgressLastSessionFeedbackKind.NONE,
    );

  const feedbackKind: ProgressLastSessionFeedbackKind = useMemo(() => {
    if (!lastCompletedWorkout) return ProgressLastSessionFeedbackKind.NONE;

    if (!lastCompletedWorkout.perceivedLoad) {
      return ProgressLastSessionFeedbackKind.AVAILABLE;
    }

    if (
      lastCompletedWorkout.perceivedLoad &&
      prevFeedbackState === ProgressLastSessionFeedbackKind.AVAILABLE
    ) {
      return ProgressLastSessionFeedbackKind.SUBMITTED;
    }

    return ProgressLastSessionFeedbackKind.SEEN;
  }, [lastCompletedWorkout, prevFeedbackState]);

  const submitFeedback = useCallback(
    (value: FeedbackValue) => {
      if (!lastCompletedWorkout) return;
      setPrevFeedbackState(ProgressLastSessionFeedbackKind.AVAILABLE);
      updateWorkout.mutate({ ...lastCompletedWorkout, perceivedLoad: value });
    },
    [lastCompletedWorkout, updateWorkout],
  );

  const lastSessionFeedback: ProgressLastSessionFeedback = useMemo(() => {
    if (!lastCompletedWorkout)
      return { kind: ProgressLastSessionFeedbackKind.NONE };

    switch (feedbackKind) {
      case ProgressLastSessionFeedbackKind.AVAILABLE:
        return {
          kind: ProgressLastSessionFeedbackKind.AVAILABLE,
          sessionLabel: `${lastCompletedWorkout.title} • ${lastCompletedWorkout.mainFocus}`,
          onClick: submitFeedback,
        };

      case ProgressLastSessionFeedbackKind.SUBMITTED:
        return {
          kind: ProgressLastSessionFeedbackKind.SUBMITTED,
          selected: true,
        };

      case ProgressLastSessionFeedbackKind.SEEN:
        return { kind: ProgressLastSessionFeedbackKind.SEEN };

      default:
        return { kind: ProgressLastSessionFeedbackKind.NONE };
    }
  }, [feedbackKind, lastCompletedWorkout, submitFeedback]);

  const stats: ProgressAchievements[] =
    getInfoAchievementProgressItems(achievements);

  const prs: ProgressAchievements[] =
    getPRAchievementProgressItems(achievements);

  const qualityTips: ProgressQualityTipItemProps[] = !lastCompletedWorkout
    ? [
        {
          label: "Training Quality",
          value: "No data",
          tone: "neutral" as const,
          hint: "Complete a workout to start seeing quality feedback.",
        },
      ]
    : !lastCompletedWorkout.perceivedLoad
      ? [
          {
            label: "Training Quality",
            value: "No data",
            tone: "neutral" as const,
            hint: "Submit perceived load after a workout to unlock quality metrics.",
          },
        ]
      : [
          {
            label: "Session Load",
            value:
              lastCompletedWorkout.perceivedLoad === "light"
                ? "Light"
                : lastCompletedWorkout.perceivedLoad === "balanced"
                  ? "Balanced"
                  : "Heavy",
            tone:
              lastCompletedWorkout.perceivedLoad === "heavy"
                ? "warning"
                : lastCompletedWorkout.perceivedLoad === "balanced"
                  ? "neutral"
                  : "positive",
            hint:
              lastCompletedWorkout.perceivedLoad === "heavy"
                ? "Consider a lighter follow-up session or extra recovery."
                : lastCompletedWorkout.perceivedLoad === "balanced"
                  ? "Load looks steady for current training rhythm."
                  : "Low load, good for recovery or technique work.",
          },
          {
            label: "Recovery",
            value:
              lastCompletedWorkout.perceivedLoad === "heavy"
                ? "Watch closely"
                : "On track",
            tone:
              lastCompletedWorkout.perceivedLoad === "heavy"
                ? "warning"
                : "positive",
            hint:
              lastCompletedWorkout.perceivedLoad === "heavy"
                ? "Give yourself more time before the next intense workout."
                : "Recovery looks acceptable based on the latest feedback.",
          },
        ];

  const kpiStats = stats.filter((stat) => stat.id !== "streak");
  const streakStat = stats.find((stat) => stat.id === "streak");

  const statsCards: ProgressStatCardProps[] = kpiStats.map((stat) => ({
    label: stat.title,
    value: showWeek ? (stat.valueWeek ?? "-") : stat.value,
    subLabel: showWeek ? stat.subLabelWeek : stat.subLabel,
  }));

  const streakCard: ProgressStatCardProps | null = streakStat
    ? {
        label: streakStat.title,
        value: showWeek ? (streakStat.valueWeek ?? "-") : streakStat.value,
        subLabel: showWeek ? streakStat.subLabelWeek : streakStat.subLabel,
      }
    : null;

  const prsItems: ProgressPRListItemProps[] = prs.map((pr) => ({
    name: pr.title,
    value: pr.value,
    diff: showWeek
      ? (pr.valueWeek ?? pr.valueDiff ?? "-")
      : (pr.valueDiff ?? "-"),
  }));

  const showPrsEmpty =
    prs.length === 0 || (prs.length === 1 && prs[0].id === "no-prs");

  const lastSessionView: ProgressLastSessionView =
    lastSessionFeedback.kind === ProgressLastSessionFeedbackKind.AVAILABLE
      ? {
          kind: "available",
          feedbackLabel: lastSessionFeedback.sessionLabel,
          streak: allProgress?.streak.current ?? 0,
          onSelect: lastSessionFeedback.onClick,
        }
      : lastSessionFeedback.kind === ProgressLastSessionFeedbackKind.SUBMITTED
        ? { kind: "submitted" }
        : lastSessionFeedback.kind === ProgressLastSessionFeedbackKind.SEEN
          ? {
              kind: "seen",
              label: "Thanks for letting us know how your last workout felt.",
              streak: allProgress?.streak.current ?? 0,
              disableButtons: true,
            }
          : {
              kind: "none",
              empty: {
                icon: "🏋️",
                title: "No completed workouts yet",
                description:
                  "Finish your first training and come back here to track your progress.",
              },
            };

  return {
    statsCards,
    streakCard,
    prsItems,
    showStatsEmpty: stats.length === 0,
    showPrsEmpty,
    toggleState: showWeek,
    toggleScope: () => setShowWeek((prev) => !prev),
    scopeLabel: `See data for ${showWeek ? "all trainings" : "this week"}`,
    lastSessionView,
    hasAnyProgress: Boolean(
      stats.find((s) => s.id === "total-workouts" && s.value !== "0"),
    ),
    streak: allProgress?.streak.current ?? 0,
    qualityTips,
    isLoading: isLoadingAchievements || isLoadingLastWorkout,
    isError: isErrorAchievements || isErrorLastWorkout,
  };
};
