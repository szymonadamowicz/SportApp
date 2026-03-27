import { cn } from "@/helpers/utils/cn";
import { FitnessInputProps } from "@/types/components/fitnessInput";
import * as React from "react";

const FitnessInput = React.forwardRef<HTMLInputElement, FitnessInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground-muted">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "rf-input-surface flex h-12 w-full rounded-xl px-4 py-3",
            "text-sm",
            "transition-all duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_2px_rgba(248,113,113,0.28)]",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

FitnessInput.displayName = "FitnessInput";

export { FitnessInput };
