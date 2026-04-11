"use client";

import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { CreateWorkoutProps } from "@/types/pages/workoutPage";

export function CreateWorkout({ onCreate }: CreateWorkoutProps) {
  return (
    <InfoPanel
      title="Create new training"
      desc="Plan a new workout and customize exercises, timing and volume."
    >
      <button
        onClick={onCreate}
        className="
          group w-full
          rounded-2xl border-2 border-dashed border-accent/40
          bg-bgHighlight/40 px-6 py-8
          text-left transition-all
          hover:border-accent hover:bg-bgHighlight/70
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex h-12 w-12 items-center justify-center
              rounded-full bg-accent/15 text-accent
              text-2xl transition group-hover:bg-accent/25
            "
          >
            ➕
          </div>

          <div>
            <p className="text-base font-semibold text-textPrimary">
              Add a new workout
            </p>
            <p className="mt-1 text-sm text-textSecondary">
              Start from scratch or reuse an existing structure
            </p>
          </div>
        </div>
      </button>
    </InfoPanel>
  );
}
