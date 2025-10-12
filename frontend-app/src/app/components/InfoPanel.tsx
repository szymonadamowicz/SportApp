"use client";

import * as React from "react";
import clsx from "clsx";
import { InfoPanelProps } from "@/types/types";

export default function InfoPanel({
  title,
  desc,
  anchorDesc,
  items,
  layout = "column",
  maxPerRow = 3,
  progress,
  className,
  dimOthers = false,
}: InfoPanelProps & { dimOthers?: boolean }) {
  const isRow = layout === "row";

  return (
    <section
      className={clsx(
        "bg-bgCard border border-borderSoft rounded-2xl mt-6 p-4 md:p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-textPrimary text-lg font-semibold">{title}</h3>

        {anchorDesc ? (
          <a
            href={anchorDesc.href ?? "#"}
            onClick={anchorDesc.onClick}
            className="text-sm text-infoBlue hover:underline hover:opacity-90 cursor-pointer select-none"
          >
            {anchorDesc.label}
          </a>
        ) : desc ? (
          <div className="text-sm text-textSecondary select-none">{desc}</div>
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
              "rounded-xl border border-borderSoft transition duration-300",
              isRow
                ? "p-4 flex flex-col justify-center items-center text-center"
                : "px-4 py-3 flex items-start justify-between gap-3",
              dimOthers && idx !== 0
                ? "opacity-40 hover:opacity-100"
                : "opacity-100",
              it.bgColor ?? "bg-bgHighlight"
            )}
          >
            <div className="min-w-0">
              <div className="text-textPrimary font-semibold truncate">
                {it.title}
              </div>
              {it.subtitle && (
                <div className="text-textPrimary text-xl font-bold mt-1 truncate">
                  {it.subtitle}
                </div>
              )}
            </div>

            {it.right && (
              <div className="shrink-0 px-2.5 py-1 rounded-full bg-accent text-white text-xs font-semibold whitespace-nowrap mt-2">
                {it.right}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
