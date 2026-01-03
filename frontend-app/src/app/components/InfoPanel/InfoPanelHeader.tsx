import { InfoPanelHeaderProps } from "@/types/infoPanel";
import { InfoPanelAnchor } from "./InfoPanelAnchor";

export function InfoPanelHeader({
  title,
  desc,
  outerButton,
  showButton,
}: InfoPanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="space-y-1">
        <h3 className="text-textPrimary text-xl md:text-2xl font-semibold">
          {title}
        </h3>
        {desc && (
          <p className="text-xs md:text-sm text-textSecondary">{desc}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {outerButton && (
          <InfoPanelAnchor
            label={outerButton.label}
            onClick={outerButton.onClick}
          />
        )}

        {showButton && (
          <button
            onClick={showButton.onClick}
            className="px-4 py-2 bg-accent text-bgMain font-semibold rounded-lg cursor-pointer hover:bg-accentHover transition-colors"
          >
            {showButton.label}
          </button>
        )}
      </div>
    </div>
  );
}
