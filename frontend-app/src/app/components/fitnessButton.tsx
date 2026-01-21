import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/helpers/utils/cn";
import { FitnessButtonProps } from "@/types/components/fitnessButton";
import { cva } from "class-variance-authority";

const fitnessButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-background-elevated active:scale-[0.98]",
        ghost:
          "text-foreground-muted hover:text-foreground hover:bg-background-elevated",
        success:
          "bg-success text-success-foreground hover:bg-success/90 active:scale-[0.98]",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-10 w-10",
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
