import { getWrapperClass } from "@/helpers/ui/EmptyStateStyles";
import { EmptyStateProps } from "@/types/components/emptyState";


export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={getWrapperClass()}>
      {icon && <div className="text-2xl opacity-80">{icon}</div>}

      <p className="font-medium text-textPrimary">{title}</p>

      {description && (
        <p className="text-sm leading-relaxed max-w-sm">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-sm font-medium text-accent hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
