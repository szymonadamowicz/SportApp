import { clickable, itemCardBase } from "@/helpers/ui/infoPanelStyles";
import { InfoPanelItemCardProps } from "@/types/components/infoPanel";
import clsx from "clsx";

export function InfoPanelItemCard({
  dimmed,
  clickable: isClickable,
  onClick,
  children,
}: InfoPanelItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        itemCardBase,
        dimmed && "opacity-40 hover:opacity-100",
        isClickable && clickable
      )}
    >
      {children}
    </div>
  );
}
