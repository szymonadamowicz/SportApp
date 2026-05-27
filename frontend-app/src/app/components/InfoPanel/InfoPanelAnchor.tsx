import { InfoPanelActionProps } from "@/types/components/infoPanel";

export const InfoPanelAnchor = ({ label, onClick }: InfoPanelActionProps) => {
  return (
    <button
      onClick={onClick}
      className="rf-soft-button min-h-11 w-full cursor-pointer select-none rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-accent/10 hover:opacity-90 sm:w-auto sm:flex-none"
    >
      {label}
    </button>
  );
};
