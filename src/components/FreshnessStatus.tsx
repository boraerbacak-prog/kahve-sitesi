"use client";

import { useState, useEffect } from "react";
import { calculateFreshness } from "@/lib/flavor-curve";
import Link from "next/link";

interface Props {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

export default function FreshnessStatus(props: Props) {
  const [result, setResult] = useState(() => calc());

  function calc() {
    return calculateFreshness({
      origin: props.origin, process: props.process, roastLevel: props.roastLevel,
      roastedAt: props.roastedAt ? new Date(props.roastedAt) : null,
      createdAt: props.createdAt ? new Date(props.createdAt) : null,
    });
  }

  useEffect(() => {
    const id = setInterval(() => setResult(calc()), 60_000);
    return () => clearInterval(id);
  }, [props.roastedAt, props.origin, props.process, props.roastLevel]);

  if (!props.roastedAt) return null;

  const { currentPhase, day, phases } = result;
  const peak = phases.find(p => p.name === "peak")!;
  const isPeak = currentPhase.name === "peak";
  const daysLeft = isPeak ? peak.endDay - day : peak.startDay - day;

  const color = isPeak ? "#10B981" : currentPhase.name === "resting" ? "#9CA3AF" : currentPhase.name === "prepeak" ? "#F59E0B" : "#B45309";
  const emoji = isPeak ? "✨" : currentPhase.name === "resting" ? "⏳" : currentPhase.name === "prepeak" ? "🌱" : "🍂";
  const label = isPeak ? "İçime Hazır" : currentPhase.name === "resting" ? "Dinleniyor" : currentPhase.name === "prepeak" ? "Açılıyor" : "Olgunluk";
  const subtitle = isPeak
    ? `${daysLeft} gün daha zirvede`
    : `${daysLeft} gün sonra zirve`;

  const total = phases[phases.length - 1].endDay;
  const pct = Math.min(100, (day / total) * 100);

  return (
    <div className="border border-border p-3 bg-white">
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-heading">{label}</span>
            <span className="text-[10px] font-mono" style={{ color }}>%{Math.round(result.overallCurve)}</span>
          </div>
          <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
          <div className="w-full h-1 bg-page-hover rounded-full mt-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <p className="text-[10px] text-muted mt-1">
            {currentPhase.nameTr} · Kavrum sonrası {day}. gün
          </p>
          <Link href="/blog/kavrum-profilleri" className="inline-block text-[10px] text-primary hover:text-primary-hover font-medium mt-1.5 underline underline-offset-2">
            Neden beklemeliyim? →
          </Link>
        </div>
      </div>
    </div>
  );
}
