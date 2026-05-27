type WorkoutRunFinishDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function WorkoutRunFinishDialog({
  onCancel,
  onConfirm,
}: WorkoutRunFinishDialogProps) {
  return (
    <div className="rf-animate-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 backdrop-blur-sm sm:items-center sm:py-6">
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
    </div>
  );
}
