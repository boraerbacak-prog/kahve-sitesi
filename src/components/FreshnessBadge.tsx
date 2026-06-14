"use client";

import { useMemo } from "react";
import { calculateFreshness, getPhaseColor, getPhaseEmoji } from "@/lib/flavor-curve";
import FreshnessTooltip from "./FreshnessTooltip";

interface Props {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | null;
  createdAt?: Date | null;
}

export default function FreshnessBadge(props: Props) {
  const result = useMemo(() => calculateFreshness(props), [
    props.origin, props.process, props.roastLevel,
    props.roastedAt?.getTime(), props.createdAt?.getTime(),
  ]);

  const { currentPhase, overallCurve } = result;
  const color = getPhaseColor(currentPhase.name);
  const emoji = getPhaseEmoji(currentPhase.name);

  const label =
    currentPhase.name === "peak"
      ? "Zirvede"
      : currentPhase.name === "prepeak"
      ? "Açılıyor"
      : currentPhase.name === "resting"
      ? "Dinleniyor"
      : "Olgun";

  return (
    <FreshnessTooltip
      origin={props.origin}
      process={props.process}
      roastLevel={props.roastLevel}
      roastedAt={props.roastedAt}
      createdAt={props.createdAt}
    >
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider cursor-pointer"
        style={{
          color,
          backgroundColor: `${color}12`,
          border: `1px solid ${color}30`,
        }}
      >
        <span>{emoji}</span>
        <span>{label}</span>
      </span>
    </FreshnessTooltip>
  );
}
