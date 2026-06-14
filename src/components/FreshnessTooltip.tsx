"use client";

import { useState, useRef, useEffect } from "react";
import { calculateFreshness, getPhaseColor, getPhaseEmoji } from "@/lib/flavor-curve";

interface Props {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | string | null;
  createdAt?: Date | string | null;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}

export default function FreshnessTooltip(props: Props) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(() => calc());
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const { currentPhase, day, phases } = result;
  const peak = phases.find(p => p.name === "peak")!;
  const col = getPhaseColor(currentPhase.name);
  const emoji = getPhaseEmoji(currentPhase.name);

  const daysLeft = currentPhase.name === "peak"
    ? peak.endDay - day
    : currentPhase.name === "maturity"
    ? 0
    : peak.startDay - day;

  const tipLabel = currentPhase.name === "peak"
    ? "Şu an en taze ve lezzetli döneminde"
    : currentPhase.name === "resting"
    ? "Dinlenmeye bıraktık, yakında içime hazır"
    : currentPhase.name === "prepeak"
    ? "Yavaş yavaş açılıyor, lezzet oturuyor"
    : "Zirve dönemi geçti ama hâlâ keyifli";

  return (
    <div ref={ref} className="relative inline-flex" onClick={() => setOpen(o => !o)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {props.children}

      {open && (
        <div
          className={`absolute bottom-full mb-2 z-[9999] w-64 bg-white border border-border shadow-xl ${
            props.align === "right" ? "right-0" : props.align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{emoji}</span>
              <span className="text-sm font-bold text-heading">{currentPhase.nameTr}</span>
              <span className="text-xs font-mono ml-auto" style={{ color: col }}>%{Math.round(result.overallCurve)}</span>
            </div>

            <p className="text-xs text-body leading-relaxed mb-2">{tipLabel}</p>

            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full" style={{ width: `${result.phaseProgress * 100}%`, backgroundColor: col }} />
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted mb-2">
              <span>Kavrum sonrası {day}. gün</span>
              {daysLeft > 0 && (
                <span className="font-medium" style={{ color: col }}>
                  {currentPhase.name === "peak" ? `${daysLeft} gün kaldı` : `${daysLeft} gün sonra zirve`}
                </span>
              )}
            </div>

            <a href="/blog/kavrum-profilleri" className="block text-[10px] text-primary hover:text-primary-hover font-medium mt-1 underline underline-offset-2">
              Neden beklemeliyim? →
            </a>
          </div>

          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-border rotate-45" />
        </div>
      )}
    </div>
  );
}
