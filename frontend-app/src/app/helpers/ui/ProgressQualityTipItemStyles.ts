import clsx from "clsx";

type Tone = "positive" | "neutral" | "warning";

export const getToneStyles = (tone: Tone) =>
  clsx(
    "rounded-2xl border",
    "bg-[linear-gradient(180deg,rgba(19,23,27,0.85),rgba(12,15,18,0.85))]",
    "shadow-[0_18px_55px_rgba(0,0,0,0.60)]",
    {
      "border-[rgba(34,197,94,0.28)]": tone === "positive",
      "shadow-[0_18px_55px_rgba(34,197,94,0.10)]": tone === "positive",

      "border-[rgba(250,204,21,0.30)]": tone === "warning",
      "shadow-[0_18px_55px_rgba(250,204,21,0.10)]": tone === "warning",

      "border-[rgba(56,189,248,0.30)]": tone === "neutral",
      "shadow-[0_18px_55px_rgba(56,189,248,0.09)]": tone === "neutral",
    },
  );

export const getToneAccent = (tone: Tone) =>
  clsx({
    "text-[var(--accent)]": tone === "positive",
    "text-[rgba(250,204,21,0.95)]": tone === "warning",
    "text-[rgba(56,189,248,0.95)]": tone === "neutral",
  });
