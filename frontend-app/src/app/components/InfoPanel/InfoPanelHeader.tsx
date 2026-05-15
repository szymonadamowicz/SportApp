import { InfoPanelHeaderProps } from "@/types/components/infoPanel";
import { InfoPanelAnchor } from "./InfoPanelAnchor";

export function InfoPanelHeader({
  title,
  desc,
  outerButton,
  showButton,
  secondaryButton,
  actions,
}: InfoPanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="space-y-1">
        <h3 className="text-[var(--text-primary)] text-xl md:text-2xl font-semibold">
          {title}
        </h3>
        {desc && (
          <p className="text-xs md:text-sm text-[var(--text-secondary)]">
            {desc}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
        {actions}

        {outerButton && (
          <InfoPanelAnchor
            label={outerButton.label}
            onClick={outerButton.onClick}
          />
        )}

        {secondaryButton && (
          <button
            type="button"
            onClick={secondaryButton.onClick}
            className="
              rf-btn-secondary
              rounded-lg
              px-4 py-2
              text-sm font-semibold
              shadow-[0_10px_24px_rgba(0,0,0,0.35)]
              active:scale-[0.99]
              transition
              cursor-pointer
            "
          >
            {secondaryButton.label}
          </button>
        )}

        {showButton && (
          <button
            type="button"
            onClick={showButton.onClick}
            className="
              rf-btn-primary
              rounded-lg
              px-4 py-2
              text-sm font-semibold
              active:scale-[0.99]
              transition
              cursor-pointer
            "
          >
            {showButton.label}
          </button>
        )}
      </div>
    </div>
  );
}
