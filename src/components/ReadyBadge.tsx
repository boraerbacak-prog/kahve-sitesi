"use client";

import { useState, useEffect } from "react";
import { calculateFreshness } from "@/lib/flavor-curve";
import FreshnessTooltip from "./FreshnessTooltip";

interface Props {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

export default function ReadyBadge(props: Props) {
  const [result, setResult] = useState(() => calc());

  function calc() {
    const roastedAt = props.roastedAt ? new Date(props.roastedAt) : null;
    const createdAt = props.createdAt ? new Date(props.createdAt) : null;
    return calculateFreshness({
      origin: props.origin,
      process: props.process,
      roastLevel: props.roastLevel,
      roastedAt,
      createdAt,
    });
  }

  useEffect(() => {
    const id = setInterval(() => setResult(calc()), 60_000);
    return () => clearInterval(id);
  }, [props.roastedAt, props.origin, props.process, props.roastLevel]);

  const { currentPhase, day, phases } = result;
  const peak = phases.find(p => p.name === "peak")!;

  if (!props.roastedAt) return null;

  const badge = (() => {
    if (currentPhase.name === "peak") {
      const daysLeft = peak.endDay - day;
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider text-green-700 bg-green-50 border border-green-200">
          ✅ İçime Hazır
          {daysLeft > 0 && <span className="opacity-70">· {daysLeft} gün</span>}
        </span>
      );
    }

    if (currentPhase.name === "resting") {
      const daysToPeak = peak.startDay - day;
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200">
          🔜 {daysToPeak} gün sonra hazır
        </span>
      );
    }

    if (currentPhase.name === "prepeak") {
      const daysToPeak = peak.startDay - day;
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200">
          🌱 {daysToPeak} gün sonra zirvede
        </span>
      );
    }

    if (currentPhase.name === "maturity") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200">
          🍂 Olgunluk dönemi
        </span>
      );
    }

    return null;
  })();

  if (!badge) return null;

  return (
    <FreshnessTooltip
      origin={props.origin}
      process={props.process}
      roastLevel={props.roastLevel}
      roastedAt={props.roastedAt}
      createdAt={props.createdAt}
    >
      {badge}
    </FreshnessTooltip>
  );
}
