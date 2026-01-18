"use client";

import { Tip } from "@/types/workout/workout";

export default function TipItem({ title }: Tip) {
  return (
    <div className="card-elevated card-hover rounded-2xl px-5 py-4">
      <p className="text-sm md:text-base text-textPrimary">{title}</p>
    </div>
  );
}
