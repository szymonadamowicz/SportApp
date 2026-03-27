import { emptyStateWrapperClass } from "@/helpers/ui/EmptyStateStyles";
import { EmptyStateProps } from "@/types/components/emptyState";

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={emptyStateWrapperClass()}>
      {icon && <div className="text-2xl opacity-80">{icon}</div>}

      <p className="font-medium text-textPrimary">{title}</p>

      {description && (
        <p className="text-sm leading-relaxed max-w-sm">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rf-soft-button mt-2 min-h-11 w-full cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-accent transition-colors duration-200 hover:bg-accent/10 hover:text-accent/80 sm:w-auto"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
