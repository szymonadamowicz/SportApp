import { InfoPanelHeaderProps } from "@/types/components/infoPanel";
import { InfoPanelAnchor } from "./InfoPanelAnchor";

export function InfoPanelHeader({
  title,
  desc,
  outerButton,
  showButton,
  secondaryButton,
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

      <div className="flex items-center gap-3 shrink-0">
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
              rounded-lg
              border border-[rgba(34,197,94,0.35)]
              bg-[rgba(34,197,94,0.08)]
              px-4 py-2
              text-sm font-semibold
              text-[var(--accent)]
              shadow-[0_10px_24px_rgba(0,0,0,0.35)]
              hover:bg-[rgba(34,197,94,0.14)]
              hover:border-[rgba(34,197,94,0.55)]
              active:scale-[0.99]
              transition
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
              rounded-lg
              px-4 py-2
              text-sm font-semibold
              text-[var(--bg-main)]
              bg-[linear-gradient(180deg,#22c55e,#16a34a)]
              shadow-[0_12px_30px_rgba(34,197,94,0.22)]
              hover:shadow-[0_16px_44px_rgba(34,197,94,0.32)]
              hover:brightness-95
              active:scale-[0.99]
              transition
            "
          >
            {showButton.label}
          </button>
        )}
      </div>
    </div>
  );
}
