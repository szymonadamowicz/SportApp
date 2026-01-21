import { fitnessButtonVariants } from "@/components/fitnessButton";
import { VariantProps } from "class-variance-authority";

export interface FitnessButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fitnessButtonVariants> {
  asChild?: boolean;
}
