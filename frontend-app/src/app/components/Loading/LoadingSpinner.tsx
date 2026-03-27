import clsx from "clsx";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export function LoadingSpinner({
  label = "Loading...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={clsx(
        "rf-loading-state flex min-h-64 items-center justify-center rounded-xl border border-borderSoft bg-bgCard/70 px-6 py-10 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div>
        <span className="mx-auto block h-10 w-10 rounded-full border-2 border-accentBlue/20 border-t-accentBlue" />
        <p className="mt-4 text-sm text-textSecondary">{label}</p>
      </div>
    </div>
  );
}
