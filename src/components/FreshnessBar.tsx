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

export default function FreshnessBar(props: Props) {
  const [result, setResult] = useState(() => calc());
  const [mounted, setMounted] = useState(false);

  function calc() {
    return calculateFreshness({
      origin: props.origin, process: props.process, roastLevel: props.roastLevel,
      roastedAt: props.roastedAt ? new Date(props.roastedAt) : null,
      createdAt: props.createdAt ? new Date(props.createdAt) : null,
    });
  }

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setResult(calc()), 60_000);
    return () => clearInterval(id);
  }, [props.roastedAt, props.origin, props.process, props.roastLevel]);

  if (!props.roastedAt) return null;

  const { currentPhase, day, phases } = result;
  const peak = phases.find(p => p.name === "peak")!;
  const isPeak = currentPhase.name === "peak";
  const daysLeft = isPeak ? peak.endDay - day : peak.startDay - day;

  const barColor = isPeak ? "#10B981" : currentPhase.name === "resting" ? "#9CA3AF" : currentPhase.name === "prepeak" ? "#F59E0B" : "#B45309";
  const label = isPeak ? `✨ ${daysLeft} gün daha zirvede` : currentPhase.name === "resting" ? `🔜 ${daysLeft} gün sonra hazır` : currentPhase.name === "prepeak" ? `🌱 ${daysLeft} gün sonra zirve` : "🍂 Olgunluk dönemi";
  const pct = Math.min(100, Math.round(result.overallCurve));

  return (
    <FreshnessTooltip
      origin={props.origin}
      process={props.process}
      roastLevel={props.roastLevel}
      roastedAt={props.roastedAt}
      createdAt={props.createdAt}
      align="right"
    >
      <div className={`cursor-default transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="font-medium" style={{ color: barColor }}>{label}</span>
          <span className="font-mono text-muted">%{pct}</span>
        </div>
        <div className="w-full h-1 bg-page-hover rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    </FreshnessTooltip>
  );
}
