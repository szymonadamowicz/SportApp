import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type WorkoutRunFinishDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function WorkoutRunFinishDialog({
  onCancel,
  onConfirm,
}: WorkoutRunFinishDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="rf-animate-overlay fixed inset-0 z-[10000] flex touch-none items-center justify-center overflow-hidden bg-black/65 px-4 py-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-sm sm:py-6"
      onTouchMove={(event) => event.preventDefault()}
      onWheel={(event) => event.preventDefault()}
    >
      <div className="rf-animate-modal w-full max-w-md rounded-2xl border border-borderSoft bg-bgCard p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
          Finish workout
        </p>
        <h3 className="mt-2 text-xl font-semibold">Finish this workout?</h3>
        <p className="mt-2 text-sm text-textSecondary">
          Current progress and notes will be saved to this session.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 w-full rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition hover:border-borderStrong hover:bg-bgHighlight/30 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rf-btn-primary min-h-11 w-full rounded-full px-4 py-2 text-sm font-semibold sm:w-auto"
          >
            Yes, finish workout
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
