"use client";

import clsx from "clsx";
import {
  panelClass,
  gridWrapper,
  columnWrapper,
} from "@/helpers/ui/infoPanelStyles";
import { InfoPanelProps } from "@/types/components/infoPanel";
import InfoPanelProgress from "./InfoPanelProgress";
import { InfoPanelHeader } from "./InfoPanelHeader";

export default function InfoPanel({
  title,
  desc,
  outerButton,
  showButton,
  secondaryButton,
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
        secondaryButton={secondaryButton}
      />

      {typeof progress === "number" && <InfoPanelProgress value={progress} />}

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
