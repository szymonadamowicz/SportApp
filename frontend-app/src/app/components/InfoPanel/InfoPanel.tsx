"use client";

import clsx from "clsx";
import { InfoPanelHeader } from "./InfoPanelHeader";
import { InfoPanelProgress } from "./InfoPanelProgress";
import {
  panelClass,
  gridWrapper,
  columnWrapper,
} from "@/helpers/ui/infoPanelStyles";
import { InfoPanelProps } from "@/types/components/infoPanel";

export default function InfoPanel({
  title,
  desc,
  outerButton,
  showButton,
  progress,
  layout = "column",
  maxPerRow = 3,
  children,
}: InfoPanelProps) {
  const isGrid = layout === "row";

  return (
    <section className={panelClass}>
      <InfoPanelHeader
        title={title}
        desc={desc}
        outerButton={outerButton}
        showButton={showButton}
      />

      {typeof progress === "number" && (
        <InfoPanelProgress progress={progress} />
      )}

      <div
        className={clsx(isGrid ? gridWrapper : columnWrapper)}
        style={
          isGrid
            ? {
                gridTemplateColumns: `repeat(${maxPerRow}, minmax(0,1fr))`,
              }
            : undefined
        }
      >
        {children}
      </div>
    </section>
  );
}
