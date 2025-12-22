export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTimeSec?: number;
  completed?: boolean;

}

export interface Workout {
  id: number;
  title: string;
  date?: string;
  muscleGroup: string;
  exercises: Exercise[];
  notes?: string;
  completed: boolean;
}


export interface Tip {
  title: string;
}

export interface Achievement {
  title: string;
  subtitle?: string;
}

export interface Highlights {
  title: string;
  subtitle?: string;
  rightPopup?: string;
}

export type InfoPanelItem = Workout | Tip | Achievement;
export type InfoPanelItems = InfoPanelItem[];

export interface InfoPanelProps {
  title: string;
  items: InfoPanelItems;
  link?: { link: string; label: string };
  desc?: string;
  displayExercises?: boolean;
  progress?: number;
  layout?: "column" | "row";
  maxPerRow?: number;
  dimOthers?: boolean;
}