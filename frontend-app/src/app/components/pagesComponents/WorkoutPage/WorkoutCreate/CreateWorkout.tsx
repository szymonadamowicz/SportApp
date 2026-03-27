"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { CreateWorkoutProps } from "@/types/pages/workoutPage";
import { Plus } from "lucide-react";

export function CreateWorkout({ onCreate }: CreateWorkoutProps) {
  return (
    <InfoPanel
      title="Create new training"
      desc="Plan a new workout and customize exercises, timing and volume."
    >
      <button
        type="button"
        onClick={onCreate}
        className="
          rf-action-button
          group w-full
          rounded-2xl border-2 border-dashed border-accentBlue/30
          bg-bgHighlight/40 px-4 py-5 sm:px-6 sm:py-8 md:rounded-lg
          text-left transition-all
          hover:border-accentBlue hover:bg-bgHighlight/70
        "
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center sm:h-12 sm:w-12
              rounded-lg border border-accentBlue/25 bg-accentBlue/10 text-accentBlue
              transition group-hover:bg-accentBlue/20
            "
          >
            <Plus size={24} />
          </div>

          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight text-textPrimary">
              Add a new workout
            </p>
            <p className="mt-1 text-sm leading-relaxed text-textSecondary">
              Start from scratch or reuse an existing structure
            </p>
          </div>
        </div>
      </button>
    </InfoPanel>
  );
}
