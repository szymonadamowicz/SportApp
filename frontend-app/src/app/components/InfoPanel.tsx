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
        "bg-bgCard border border-borderSoft rounded-2xl mt-6 p-6 md:p-7 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-textPrimary text-xl font-semibold">{title}</h3>

        {anchorDesc ? (
          <a
            href={anchorDesc.href ?? "#"}
            onClick={anchorDesc.onClick}
            className="text-sm text-accent hover:underline hover:opacity-90 cursor-pointer select-none"
          >
            {anchorDesc.label}
          </a>
        ) : desc ? (
          <div className="text-sm text-textSecondary select-none">{desc}</div>
        ) : null}
      </div>

      {typeof progress === "number" && (
        <div className="mt-4 h-2 w-full rounded-full bg-bgHighlight overflow-hidden">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
            aria-hidden
          />
        </div>
      )}

      <div
        className={clsx("mt-5", isRow ? "grid gap-4" : "flex flex-col gap-4")}
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
                ? "p-5 flex flex-col justify-center items-center text-center"
                : "px-5 py-4 flex items-start justify-between gap-4",
              dimOthers && idx !== 0
                ? "opacity-40 hover:opacity-100"
                : "opacity-100",
              it.bgColor ?? "bg-bgHighlight"
            )}
          >
            <div className="min-w-0">
              <div className="text-textPrimary text-lg font-semibold truncate">
                {it.title}
              </div>
              {it.subtitle && (
                <div className="text-textPrimary text-2xl font-bold mt-1.5 truncate">
                  {it.subtitle}
                </div>
              )}
            </div>

            {it.rightButton ? (
              <a
                href={it.rightButton.href}
                className={clsx(
                  "shrink-0 inline-flex items-center justify-center",
                  "px-5 py-2.5 rounded-lg bg-accent text-white text-base font-semibold shadow-md",
                  "hover:bg-accentHover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50",
                  "transition-transform transform hover:scale-[1.03]",
                  "whitespace-nowrap",
                  isRow ? "mt-3" : ""
                )}
              >
                {it.rightButton.label}
              </a>
            ) : it.right ? (
              <div
                className={clsx(
                  "shrink-0 px-3.5 py-1.5 rounded-full bg-accent text-white text-sm font-semibold whitespace-nowrap",
                  isRow ? "mt-3" : ""
                )}
              >
                {it.right}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
