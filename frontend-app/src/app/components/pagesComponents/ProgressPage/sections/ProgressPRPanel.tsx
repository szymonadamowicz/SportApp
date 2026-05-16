"use client";

import EmptyState from "@/components/EmptyState/EmptyState";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { ProgressPRListItemProps } from "@/types/pages/progressPage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PRListItem } from "./ProgressPRListItem";

const ITEMS_PER_PAGE = 4;

type ProgressPRPanelProps = {
  items: ProgressPRListItemProps[];
  isEmpty: boolean;
  pageKey: string;
};

export function ProgressPRPanel({
  items,
  isEmpty,
  pageKey,
}: ProgressPRPanelProps) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [pageKey]);

  const pageCount = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () =>
      items.slice(
        safePage * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
      ),
    [items, safePage],
  );

  const showPagination = !isEmpty && items.length > ITEMS_PER_PAGE;

  return (
    <InfoPanel title="PRs & Benchmarks">
      {isEmpty ? (
        <EmptyState
          icon="T"
          title="No PRs yet"
          description="Once you complete workouts, your best sets will show up here."
        />
      ) : (
        <>
          {pageItems.map((pr) => (
            <PRListItem
              key={pr.name}
              name={pr.name}
              value={pr.value}
              diff={pr.diff}
            />
          ))}

          {showPagination && (
            <div className="mt-1 flex items-center justify-between gap-3 rounded-lg border border-borderSoft bg-bgHighlight/25 px-3 py-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={safePage === 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-borderSoft text-textSecondary transition hover:border-borderStrong hover:text-textPrimary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous PR page"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="text-xs font-medium text-textSecondary">
                {safePage + 1} / {pageCount}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(pageCount - 1, current + 1))
                }
                disabled={safePage >= pageCount - 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-borderSoft text-textSecondary transition hover:border-borderStrong hover:text-textPrimary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next PR page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </>
      )}
    </InfoPanel>
  );
}
