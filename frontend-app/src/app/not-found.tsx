import Link from "next/link";

export default function NotFound() {
  return (
    <main className="rf-page-radial flex min-h-dvh items-center justify-center px-4 py-12">
      <section className="rf-surface-panel w-full max-w-md rounded-2xl p-6 text-center sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-textMuted">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-textPrimary">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-textSecondary">
          This view does not exist or was moved.
        </p>
        <Link
          href="/dashboard"
          className="rf-btn-primary mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold"
        >
          Back to app
        </Link>
      </section>
    </main>
  );
}
