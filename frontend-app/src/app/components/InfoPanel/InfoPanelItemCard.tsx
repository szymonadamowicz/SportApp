import { clickable, itemCardBase } from "@/helpers/ui/infoPanelStyles";
import clsx from "clsx";

type Props = {
  dimmed?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export function InfoPanelItemCard({
  dimmed,
  clickable: isClickable,
  onClick,
  children,
}: Props) {
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
