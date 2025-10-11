"use client";

import * as React from "react";
import clsx from "clsx";

export type PanelItem = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

type InfoPanelProps = {
  title: string;
  desc?: React.ReactNode;
  items: PanelItem[];
  layout?: "column" | "row";
  maxPerRow?: number;
  progress?: number;
  className?: string;
};

export default function InfoPanel({
  title,
  desc,
  items,
  layout = "column",
  maxPerRow = 3,
  progress,
  className,
}: InfoPanelProps) {
  const isRow = layout === "row";

  return (
    <section
      className={clsx(
        "bg-bgCard border border-borderSoft rounded-2xl p-4 md:p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-textPrimary text-lg font-semibold">{title}</h3>
        {desc ? (
          <div className="text-sm text-infoBlue hover:opacity-90 cursor-pointer select-none">
            {desc}
          </div>
        ) : null}
      </div>

      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-bgHighlight overflow-hidden">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
            aria-hidden
          />
        </div>
      )}

      <div
        className={clsx("mt-4", isRow ? "grid gap-3" : "flex flex-col gap-3")}
        style={
          isRow
            ? ({
                gridTemplateColumns: `repeat(${Math.max(
                  1,
                  Math.floor(maxPerRow)
                )}, minmax(0, 1fr))`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {items.map((it, idx) => (
          <div
            key={idx}
            className={clsx(
              "rounded-xl border border-borderSoft bg-bgHighlight",
              isRow ? "p-4 flex items-center justify-between" : "px-4 py-3 flex items-start justify-between gap-3"
            )}
          >
            <div className={clsx("min-w-0", isRow ? "" : "")}>
              <div className="text-textPrimary font-semibold truncate">
                {it.title}
              </div>
              {it.subtitle ? (
                <div className="text-textSecondary text-sm truncate">
                  {it.subtitle}
                </div>
              ) : null}
            </div>
            {it.right ? <div className="shrink-0">{it.right}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
