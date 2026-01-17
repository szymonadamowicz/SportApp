import {
  getInfoAchievementProgressItems,
  getPRAchievementProgressItems,
} from "@/helpers/utils/selectors/progress/progressSelector";
import { useProgressAchievements } from "@/hooks/apiHooks/progress/useProgressAchievements";
import { useProgressStreak } from "@/hooks/apiHooks/progress/useProgressStreak";
import { useLastCompletedWorkout } from "@/hooks/apiHooks/workouts/useLastCompletedWorkout";
import { useUpdateWorkout } from "@/hooks/apiHooks/workouts/useUpdateWorkout";
import {
  ProgressQualityTipItemProps,
  ProgressLastSessionFeedbackKind,
  ProgressLastSessionFeedback,
  FeedbackValue,
} from "@/types/pages/progressPage";
import { ProgressAchievements } from "@/types/progress/progress";
import { useCallback, useMemo, useState } from "react";

export const useProgressPageVM = () => {
  const { achievements } = useProgressAchievements();
  const { streak } = useProgressStreak();
  const { lastCompletedWorkout } = useLastCompletedWorkout();

  const updateWorkout = useUpdateWorkout();

  const [toggleState, setToggleState] = useState(false)
  const [prevState, setPrevState] = useState<ProgressLastSessionFeedbackKind>(
    ProgressLastSessionFeedbackKind.NONE
  );
  const feedbackKind: ProgressLastSessionFeedbackKind = useMemo(() => {
    if (!lastCompletedWorkout) {
      return ProgressLastSessionFeedbackKind.NONE;
    }

    if (!lastCompletedWorkout.perceivedLoad) {
      return ProgressLastSessionFeedbackKind.AVAILABLE;
    }

    if (
      lastCompletedWorkout.feedbackSeenAt &&
      prevState === ProgressLastSessionFeedbackKind.AVAILABLE
    ) {
      return ProgressLastSessionFeedbackKind.SUBMITTED;
    }

    return ProgressLastSessionFeedbackKind.SEEN;
  }, [lastCompletedWorkout, prevState]);

  const submitFeedback = useCallback(
    (value: FeedbackValue) => {
      if (!lastCompletedWorkout) return;
      setPrevState(ProgressLastSessionFeedbackKind.AVAILABLE);
      updateWorkout.mutate({...lastCompletedWorkout, perceivedLoad: value});
    },
    [lastCompletedWorkout, updateWorkout]
  );

  const lastSessionFeedback: ProgressLastSessionFeedback = useMemo(() => {
    if (!lastCompletedWorkout) {
      return { kind: ProgressLastSessionFeedbackKind.NONE };
    }

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
        return {
          kind: ProgressLastSessionFeedbackKind.SEEN,
        };

      default:
        return { kind: ProgressLastSessionFeedbackKind.NONE };
    }
  }, [feedbackKind, lastCompletedWorkout, submitFeedback]);

  const stats: ProgressAchievements[] =
    getInfoAchievementProgressItems(achievements);

  const prs: ProgressAchievements[] =
    getPRAchievementProgressItems(achievements);

  const qualityTips: ProgressQualityTipItemProps[] = [
    {
      label: "Avg Intensity",
      value: "Balanced",
      tone: "positive",
      hint: "RPE within optimal range",
    },
    {
      label: "Recovery",
      value: "Needs attention",
      tone: "warning",
      hint: "Short rest between sessions",
    },
  ];

  return {
    stats,
    prs,
    toggleState,
    settoggleState: () => setToggleState(prev => !prev),
    lastSessionFeedback,
    streak: streak?.days ?? 0,
    qualityTips,
  };
};
