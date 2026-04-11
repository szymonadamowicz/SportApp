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
    <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h3 className="break-words text-lg font-semibold leading-tight text-[var(--text-primary)] sm:text-xl md:text-2xl">
          {title}
        </h3>
        {desc && (
          <p className="text-xs leading-relaxed text-[var(--text-secondary)] md:text-sm">
            {desc}
          </p>
        )}
      </div>

      <div className="grid w-full shrink-0 grid-cols-1 items-stretch gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        {actions && <div className="col-span-full sm:contents">{actions}</div>}

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
              rf-action-button
              rounded-lg
              min-h-11 w-full px-4 py-2 sm:w-auto sm:flex-none
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
              rf-action-button
              rounded-lg
              min-h-11 w-full px-4 py-2 sm:w-auto sm:flex-none
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
