"use client";

import type { CSSProperties } from "react";
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
  actions,
  progress,
  layout = "column",
  maxPerRow = 3,
  children,
}: InfoPanelProps) {
  const isGrid = layout === "row";
  const gridStyle = {
    "--rf-max-per-row": maxPerRow,
  } as CSSProperties;

  return (
    <section className={panelClass}>
      <InfoPanelHeader
        title={title}
        desc={desc}
        outerButton={outerButton}
        showButton={showButton}
        secondaryButton={secondaryButton}
        actions={actions}
      />

      {typeof progress === "number" && <InfoPanelProgress value={progress} />}

      <div
        className={clsx(isGrid ? gridWrapper : columnWrapper)}
        style={isGrid ? gridStyle : undefined}
      >
        {children}
      </div>
    </section>
  );
}
