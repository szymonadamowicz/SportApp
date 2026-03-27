import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/helpers/utils/cn";
import { FitnessButtonProps } from "@/types/components/fitnessButton";
import { cva } from "class-variance-authority";

const fitnessButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "rf-btn-primary active:scale-[0.98]",
        secondary: "rf-btn-secondary active:scale-[0.98]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)]",
        success: "rf-btn-primary active:scale-[0.98]",
        destructive: "rf-btn-danger active:scale-[0.98]",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-11 px-4 py-2 md:h-10",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-11 w-11 md:h-10 md:w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

const FitnessButton = React.forwardRef<HTMLButtonElement, FitnessButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(fitnessButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

FitnessButton.displayName = "FitnessButton";

export { FitnessButton, fitnessButtonVariants };
