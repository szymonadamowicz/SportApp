"use client";

import { Tag } from "@/components/Tag/Tag";
import { Highlights } from "@/types/workout/workout";

type Props = {
  highlight: Highlights;
};

export default function HighlightItem({ highlight }: Props) {
  const highlightClass = highlight.rightPopup ? "state-highlight" : "";

  return (
    <div
      className={`card-elevated card-hover rounded-2xl px-5 py-4 flex items-center justify-between gap-4 ${highlightClass}`}
    >
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

      {highlight.rightPopup && <Tag label={highlight.rightPopup} />}
    </div>
  );
}
