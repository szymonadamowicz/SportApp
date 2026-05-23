import { InfoPanelActionProps } from "@/types/components/infoPanel";

export const InfoPanelAnchor = ({ label, onClick }: InfoPanelActionProps) => {
  return (
    <button
      onClick={onClick}
      className="rf-soft-button rounded-md px-1.5 py-1 text-sm text-accent hover:bg-accent/10 hover:opacity-90 cursor-pointer select-none"
    >
      {label}
    </button>
  );
};
