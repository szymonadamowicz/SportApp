import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
  previousLabel: string;
  nextLabel: string;
};

export function PaginationControls({
  page,
  pageCount,
  onPrevious,
  onNext,
  previousLabel,
  nextLabel,
}: PaginationControlsProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-borderSoft bg-bgHighlight/25 px-3 py-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={page === 0}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-borderSoft text-textSecondary transition hover:border-borderStrong hover:text-textPrimary disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
        aria-label={previousLabel}
      >
        <ChevronLeft size={17} />
      </button>

      <span className="text-xs font-medium text-textSecondary">
        {page + 1} / {pageCount}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={page >= pageCount - 1}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-borderSoft text-textSecondary transition hover:border-borderStrong hover:text-textPrimary disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
        aria-label={nextLabel}
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
