export type ProgressStreak = {
  days: number;
};

export type ProgressStatCardProps = {
  label: string;
  value: string;
  subLabel?: string;
};

export type ProgressPRListItemProps = {
  name: string;
  value: string;
  diff?: string;
};

export type ProgressQualityTipItemProps = {
  label: string;
  value: string;
  tone: "positive" | "neutral" | "warning";
  hint?: string;
};

export enum ProgressLastSessionFeedbackKind {
  "NONE" = "none",
  "AVAILABLE" = "available",
  "SEEN" = "seen",
  "SUBMITTED" = "submitted",
}

export type ProgressLastSessionFeedback =
  | {
      kind: ProgressLastSessionFeedbackKind.NONE;
    }
  | {
      kind: ProgressLastSessionFeedbackKind.AVAILABLE;
      sessionLabel: string;
      onClick: (value: FeedbackValue) => void;
    }
  | {
      kind: ProgressLastSessionFeedbackKind.SEEN;
    }
  | {
      kind: ProgressLastSessionFeedbackKind.SUBMITTED;
      selected: true;
    };

export type FeedbackValue = "light" | "balanced" | "heavy";

export type ProgressLastSessionFeedbackProps = {
  label?: string;
  selected?: boolean;
  streak?: number;
  submitted?: boolean;
  disableButtons?: boolean;
  onSelect?: (value: FeedbackValue) => void;
};

export type ProgressLastSessionView =
  | {
      kind: "available";
      feedbackLabel: string;
      streak: number;
      onSelect: (value: FeedbackValue) => void;
    }
  | {
      kind: "submitted";
    }
  | {
      kind: "seen";
      label: string;
      streak: number;
      disableButtons: true;
    }
  | {
      kind: "none";
      empty: {
        icon: string;
        title: string;
        description: string;
      };
    };
