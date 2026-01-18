import { cn } from "@/helpers/utils/cn";
import * as React from "react";

export interface FitnessInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

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
            "flex h-12 w-full rounded-xl bg-background-elevated border border-border px-4 py-3",
            "text-sm text-foreground placeholder:text-foreground-disabled",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition-all duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-destructive focus:ring-destructive/30 focus:border-destructive",
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
