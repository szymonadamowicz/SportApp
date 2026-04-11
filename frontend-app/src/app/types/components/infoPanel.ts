export interface InfoPanelActionProps {
  label: string;
  onClick: () => void;
}

export interface InfoPanelHeaderProps {
  title: string;
  desc?: string;
  outerButton?: InfoPanelActionProps;
  showButton?: {
    label: string;
    onClick: () => void;
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
  };
}

export interface InfoPanelProps {
  title: string;
  desc?: string;
  outerButton?: InfoPanelActionProps;
  showButton?: InfoPanelActionProps;
  progress?: number;
  layout?: "column" | "row";
  maxPerRow?: number;
  children: React.ReactNode;
  secondaryButton?: {
    label: string;
    onClick: () => void;
  };
}

export type TipItemTone = "positive" | "neutral" | "warning";

export interface InfoPanelProgressProps {
  value: number;
}
