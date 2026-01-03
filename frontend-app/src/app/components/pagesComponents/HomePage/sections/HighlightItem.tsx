"use client";

import Tag from "@/components/Tag/Tag";
import { getWorkoutTagClass } from "@/helpers/ui/workoutTagStyles";
import { Highlights } from "@/types/workout";

type Props = {
  highlight: Highlights;
};

export default function HighlightItem({ highlight }: Props) {
  return (
    <div className="rounded-2xl border border-borderSoft bg-bgHighlight/70 px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-textPrimary truncate">
          {highlight.title}
        </p>

        {highlight.subtitle && (
          <p className="text-sm text-textSecondary truncate">
            {highlight.subtitle}
          </p>
        )}
      </div>

      {highlight.rightPopup && (
        <Tag
          label={highlight.rightPopup}
          className={getWorkoutTagClass("default")}
        />
      )}
    </div>
  );
}
