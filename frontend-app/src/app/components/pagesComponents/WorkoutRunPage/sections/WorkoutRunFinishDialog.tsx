type WorkoutRunFinishDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function WorkoutRunFinishDialog({
  onCancel,
  onConfirm,
}: WorkoutRunFinishDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-borderSoft bg-bgCard p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
          Finish workout
        </p>
        <h3 className="mt-2 text-xl font-semibold">Finish this workout?</h3>
        <p className="mt-2 text-sm text-textSecondary">
          Current progress and notes will be saved to this session.
        </p>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-borderSoft px-4 py-2 text-sm text-textPrimary transition hover:border-borderStrong hover:bg-bgHighlight/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full px-4 py-2 text-sm font-semibold rf-btn-primary"
          >
            Yes, finish workout
          </button>
        </div>
      </div>
    </div>
  );
}
