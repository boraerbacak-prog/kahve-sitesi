"use client";

import { useMemo } from "react";
import { calculateFreshness, getPhaseEmoji, getPhaseColor, getPhaseDescription, getDaysUntilNextPhase, type CurveResult } from "@/lib/flavor-curve";

interface Props {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | null;
  createdAt?: Date | null;
}

function generateCurvePath(result: CurveResult, width: number, height: number): string {
  const phases = result.phases;
  const total = result.totalDays;
  const points: { x: number; y: number }[] = [];

  const samples = 200;
  for (let i = 0; i <= samples; i++) {
    const day = (i / samples) * total;
    const clampedDay = Math.max(0, Math.min(day, total));
    const x = (clampedDay / total) * width;
    const y = height - (calculateFreshnessAtDay(clampedDay, phases) / 100) * height * 0.9 - height * 0.05;
    points.push({ x, y });
  }

  const p0 = points[0];
  let path = `M ${p0.x} ${p0.y}`;
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i];
    path += ` L ${p1.x} ${p1.y}`;
  }
  return path;
}

function calculateFreshnessAtDay(day: number, phases: any[]): number {
  const resting = phases[0];
  const prepeak = phases[1];
  const peak = phases[2];
  const maturity = phases[3];
  const restRamp = 0.5;

  if (day <= resting.endDay) {
    const t = resting.endDay > 0 ? day / resting.endDay : 0;
    return Math.min(restRamp, t * restRamp) * 100;
  }

  if (day < prepeak.endDay) {
    const range = prepeak.endDay - prepeak.startDay;
    const t = range > 0 ? (day - prepeak.startDay) / range : 0;
    const eased = t * t * (3 - 2 * t);
    return (restRamp + eased * (0.95 - restRamp)) * 100;
  }

  if (day < peak.endDay) {
    const mid = (peak.startDay + peak.endDay) / 2;
    const halfRange = (peak.endDay - peak.startDay) / 2;
    const dist = halfRange > 0 ? Math.abs(day - mid) / halfRange : 0;
    return 100 - dist * dist * 10;
  }

  if (day < maturity.endDay) {
    const range = maturity.endDay - maturity.startDay;
    const t = range > 0 ? (day - maturity.startDay) / range : 0;
    return 100 * (1 - t * 0.6);
  }

  return 20;
}

export default function FreshnessCurve(props: Props) {
  const result = useMemo(() => calculateFreshness(props), [props.origin, props.process, props.roastLevel, props.roastedAt?.getTime(), props.createdAt?.getTime()]);

  const width = 360;
  const height = 140;
  const curvePath = useMemo(() => generateCurvePath(result, width, height), [result]);

  const currentX = (result.day / result.totalDays) * width;
  const currentY = height - (result.overallCurve / 100) * height * 0.9 - height * 0.05;
  const phaseColor = getPhaseColor(result.currentPhase.name);
  const daysUntilNext = getDaysUntilNextPhase(result);

  return (
    <div className="border border-border p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-heading uppercase tracking-wider">Tazelik Eğrisi</h3>
        <span className="text-xs text-muted">{result.day}. gün</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id="freshnessGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.3" />
            <stop offset={`${(result.day / result.totalDays) * 100}%`} stopColor={phaseColor} stopOpacity="0.3" />
            <stop offset={`${(result.day / result.totalDays) * 100}%`} stopColor={phaseColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={phaseColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {result.phases.map((phase, i) => {
          const x1 = (phase.startDay / result.totalDays) * width;
          const x2 = (phase.endDay / result.totalDays) * width;
          return (
            <rect
              key={phase.name}
              x={x1}
              y={0}
              width={x2 - x1}
              height={height}
              fill={getPhaseColor(phase.name)}
              fillOpacity={result.currentPhase.name === phase.name ? 0.08 : 0.03}
            />
          );
        })}

        <path d={curvePath} fill="none" stroke="url(#freshnessGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        <circle cx={currentX} cy={currentY} r="6" fill={phaseColor} stroke="white" strokeWidth="2.5" />

        {result.phases.map((phase) => {
          const midX = ((phase.startDay + phase.endDay) / 2 / result.totalDays) * width;
          return (
            <text
              key={phase.name}
              x={midX}
              y={height - 6}
              textAnchor="middle"
              className="text-[9px]"
              fill={result.currentPhase.name === phase.name ? "#1a1a1a" : "#9CA3AF"}
              fontWeight={result.currentPhase.name === phase.name ? "600" : "400"}
              fontSize="9"
            >
              {phase.nameTr}
            </text>
          );
        })}
      </svg>

      <div className="mt-4 flex items-start gap-3 p-3" style={{ backgroundColor: `${phaseColor}10`, borderLeft: `3px solid ${phaseColor}` }}>
        <span className="text-xl mt-0.5">{getPhaseEmoji(result.currentPhase.name)}</span>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-heading">{result.currentPhase.nameTr}</span>
            <span className="text-xs font-mono" style={{ color: phaseColor }}>
              %{Math.round(result.overallCurve)}
            </span>
          </div>
          <p className="text-xs text-body leading-relaxed">{getPhaseDescription(result)}</p>
          {daysUntilNext !== null && result.currentPhase.name !== "maturity" && (
            <p className="text-xs text-muted mt-1.5">
              {result.currentPhase.name === "resting" ? "İçim için bekle: " : "Kalan: "}
              <strong>{daysUntilNext} gün</strong>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
        <span>Kavrum</span>
        <span>{result.totalDays}. gün → Olgunluk sonu</span>
      </div>
    </div>
  );
}
