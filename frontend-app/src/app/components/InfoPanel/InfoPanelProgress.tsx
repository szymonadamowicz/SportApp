import React from "react";

interface InfoPanelProgressProps {
  progress: number;
}

export const InfoPanelProgress: React.FC<InfoPanelProgressProps> = ({
  progress,
}) => {
  return (
    <div className="mt-4 h-2 w-full rounded-full bg-bgHighlight overflow-hidden">
      <div
        className="h-full bg-accent transition-[width] duration-300"
        style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
        aria-hidden
      />
    </div>
  );
};
