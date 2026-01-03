"use client";

import { Tip } from "@/types/workout";

export default function TipItem({ title }: Tip) {
  return (
    <div className="rounded-2xl border border-borderSoft bg-bgHighlight/70 px-5 py-4">
      <p className="text-sm md:text-base text-textPrimary">{title}</p>
    </div>
  );
}
