"use client";

import Tag from "@/components/Tag/Tag";
import { ProgressPRListItemProps } from "@/types/pages/progressPage";

export function PRListItem({ name, value, diff }: ProgressPRListItemProps) {
  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl border border-borderSoft
        bg-bgHighlight/60
        px-4 py-3
      "
    >
      <div>
        <p className="text-sm font-medium text-textPrimary">{name}</p>
        <p className="text-xs text-textSecondary">{value}</p>
      </div>

      {diff && (
        <Tag label={`PR ${diff}`} className="bg-green-500/20 text-green-400" />
      )}
    </div>
  );
}
