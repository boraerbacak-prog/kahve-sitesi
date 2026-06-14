"use client";

import { useState, useEffect, useRef } from "react";
import { calculateFreshness } from "@/lib/flavor-curve";

interface Props {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

const phaseColors: Record<string, { bar: string; text: string; bg: string }> = {
  resting:  { bar: "#9CA3AF", text: "#6B7280", bg: "#F3F4F6" },
  prepeak:  { bar: "#FCD34D", text: "#B45309", bg: "#FFFBEB" },
  peak:     { bar: "#10B981", text: "#047857", bg: "#ECFDF5" },
  maturity: { bar: "#F59E0B", text: "#B45309", bg: "#FFF7ED" },
};

export default function FreshnessTimeline(props: Props) {
  const [result, setResult] = useState(() => calc());
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { currentPhase, day, phases, totalDays } = result;
  const peak = phases.find(p => p.name === "peak")!;

  const total = totalDays || 60;
  const currentColor = phaseColors[currentPhase.name] || phaseColors.resting;

  return (
    <div ref={ref} className="border border-border bg-white">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-heading uppercase tracking-wider">Tazelik Takvimi</h3>
          <span className="text-[10px] text-muted">{day >= 0 ? `Kavrum sonrası ${day}. gün` : "Kavrum tarihi bekleniyor"}</span>
        </div>

        <div className="relative h-20 mb-6">
          <svg viewBox="0 0 600 80" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="phaseRest" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={phaseColors.resting.bar} stopOpacity="0.3" />
                <stop offset="100%" stopColor={phaseColors.resting.bar} stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="phasePre" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={phaseColors.prepeak.bar} stopOpacity="0.3" />
                <stop offset="100%" stopColor={phaseColors.prepeak.bar} stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="phasePeak" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={phaseColors.peak.bar} stopOpacity="0.4" />
                <stop offset="100%" stopColor={phaseColors.peak.bar} stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="phaseMat" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={phaseColors.maturity.bar} stopOpacity="0.3" />
                <stop offset="100%" stopColor={phaseColors.maturity.bar} stopOpacity="0.1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {phases.map((phase, i) => {
              const x = (phase.startDay / total) * 600;
              const w = Math.max(2, ((phase.endDay - phase.startDay) / total) * 600);
              const colors = phaseColors[phase.name] || phaseColors.resting;
              const isActive = phase.name === currentPhase.name;
              return (
                <g key={phase.name}>
                  <rect x={x} y={30} width={w} height={20} rx="2"
                    fill={isActive ? colors.bar + "22" : `url(#phase${phase.name.charAt(0).toUpperCase() + phase.name.slice(1)})`}
                    stroke={isActive ? colors.bar : "transparent"}
                    strokeWidth={isActive ? 1.5 : 0}
                  />
                  <text x={x + w / 2} y={66} textAnchor="middle"
                    fill={isActive ? colors.text : "#9CA3AF"}
                    fontSize="9" fontWeight={isActive ? "600" : "400"}
                  >
                    {phase.nameTr}
                  </text>
                </g>
              );
            })}

            <line x1={0} y1={40} x2={600} y2={40} stroke="#E5E7EB" strokeWidth="1" />

            {day >= 0 && (
              <g>
                <circle cx={(day / total) * 600} cy={40} r="7"
                  fill={currentColor.bar}
                  stroke="white" strokeWidth="2.5"
                  filter={currentPhase.name === "peak" ? "url(#glow)" : undefined}
                />
                <text x={(day / total) * 600} y={18} textAnchor="middle"
                  fill={currentColor.text} fontSize="10" fontWeight="600"
                >
                  {day}. gün
                </text>
              </g>
            )}

            {[peak.startDay, peak.endDay].map(d => (
              d > 0 && (
                <g key={d}>
                  <line x1={(d / total) * 600} y1={28} x2={(d / total) * 600} y2={52}
                    stroke={phaseColors.peak.bar} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"
                  />
                  <text x={(d / total) * 600} y={76} textAnchor="middle" fill="#9CA3AF" fontSize="8">{d}.g</text>
                </g>
              )
            ))}
          </svg>
        </div>

        <div className={`p-4 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0 translate-y-2"}`}
          style={{
            backgroundColor: currentColor.bg,
            borderLeft: `3px solid ${currentColor.bar}`,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-heading">{currentPhase.nameTr}</span>
            <span className="text-xs font-mono" style={{ color: currentColor.text }}>
              %{Math.round(result.overallCurve)}
            </span>
          </div>

          <div className="w-full bg-white rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${result.phaseProgress * 100}%`,
                backgroundColor: currentColor.bar,
              }}
            />
          </div>

          <p className="text-xs text-body mt-2">
            {day < peak.startDay
              ? `🍂 Şu an dinlenme/pre-zirve evresinde. ${peak.startDay - day} gün sonra zirve lezzete ulaşacak.`
              : currentPhase.name === "peak"
              ? `✨ Zirvede! Bu mükemmel içim aralığı ${peak.endDay - day} gün daha sürecek. Hemen demleyin.`
              : `🍂 Olgunluk evresinde. Zirve geride kaldı ama hâlâ keyifli.`}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
          <span>🔥 Kavrum</span>
          <span>✨ Zirve ({peak.startDay}-{peak.endDay}. gün)</span>
          <span>🍂 Olgunluk ({totalDays}+)</span>
        </div>
      </div>
    </div>
  );
}
