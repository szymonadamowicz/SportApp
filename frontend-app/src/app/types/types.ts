export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTimeSec?: number;
}

export interface Workout {
  id: string;
  name: string;
  date?: string;
  muscleGroup: string;
  exercises: Exercise[];
  notes?: string;
  completed: boolean;
}

export interface PanelItem {
  id?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  workout?: Workout;
  bgColor?: string;
}

export interface InfoPanelProps {
  title: string;
  desc?: React.ReactNode;
  anchorDesc?: { label: string; href: string; onClick?: () => void };
  items: PanelItem[];
  layout?: "column" | "row";
  maxPerRow?: number;
  progress?: number;
  className?: string;
  dimOthers?: boolean;
}
