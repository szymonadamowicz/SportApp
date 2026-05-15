import { InfoPanelActionProps } from "@/types/components/infoPanel";

export const InfoPanelAnchor = ({ label, onClick }: InfoPanelActionProps) => {
  return (
    <button
      onClick={onClick}
      className="text-sm text-accent hover:underline hover:opacity-90 cursor-pointer select-none"
    >
      {label}
    </button>
  );
};
