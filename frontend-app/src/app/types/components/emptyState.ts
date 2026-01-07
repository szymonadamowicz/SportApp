import { Workout } from "../workout/workout";

export type EmptyStateVariant = "default" | "soft" | "highlight";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: EmptyStateVariant;
  missed?: boolean;
  missedItems?: Workout[];
};
