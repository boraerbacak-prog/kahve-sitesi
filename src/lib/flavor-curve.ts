import { getFreshnessProfile, type PhaseDef } from "./freshness-data";

export interface CurveResult {
  day: number;
  totalDays: number;
  currentPhase: PhaseDef;
  phaseProgress: number; // 0-1 within current phase
  overallCurve: number; // 0-100 freshness score
  phases: PhaseDef[];
}

const TYPICAL_ROAST_OFFSET_DAYS = 14;

export function calculateFreshness(product: {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | null;
  createdAt?: Date | null;
}, today: Date = new Date()): CurveResult {
  const profile = getFreshnessProfile(product);
  const phases = profile.phases;
  const totalDays = phases[phases.length - 1].endDay;

  const roastDate = product.roastedAt
    ? new Date(product.roastedAt)
    : product.createdAt
    ? new Date(product.createdAt)
    : null;

  const day = roastDate
    ? Math.floor((today.getTime() - roastDate.getTime()) / (1000 * 60 * 60 * 24))
    : TYPICAL_ROAST_OFFSET_DAYS;

  const clampedDay = Math.max(0, Math.min(day, totalDays));

  const currentPhaseIdx = phases.findIndex((p) => clampedDay >= p.startDay && clampedDay < p.endDay);
  const currentPhase = currentPhaseIdx >= 0
    ? phases[currentPhaseIdx]
    : clampedDay >= totalDays
    ? phases[phases.length - 1]
    : phases[0];

  const phaseProgress = currentPhase.endDay > currentPhase.startDay
    ? (clampedDay - currentPhase.startDay) / (currentPhase.endDay - currentPhase.startDay)
    : 0;

  const overallCurve = calculateCurveValue(clampedDay, phases);

  return {
    day: clampedDay,
    totalDays,
    currentPhase,
    phaseProgress: Math.min(1, Math.max(0, phaseProgress)),
    overallCurve,
    phases,
  };
}

function calculateCurveValue(day: number, phases: PhaseDef[]): number {
  const resting = phases[0];
  const prepeak = phases[1];
  const peak = phases[2];
  const maturity = phases[3];

  const restRamp = 0.5;
  if (day <= resting.endDay) {
    const t = day / resting.endDay;
    return Math.min(restRamp, t * restRamp);
  }

  if (day < prepeak.endDay) {
    const t = (day - prepeak.startDay) / (prepeak.endDay - prepeak.startDay);
    const eased = t * t * (3 - 2 * t);
    return restRamp + eased * (0.95 - restRamp);
  }

  if (day < peak.endDay) {
    const mid = (peak.startDay + peak.endDay) / 2;
    const halfRange = (peak.endDay - peak.startDay) / 2;
    const dist = Math.abs(day - mid) / halfRange;
    const curveVal = 1 - dist * dist * 0.1;
    return Math.min(100, curveVal * 100);
  }

  if (day < maturity.endDay) {
    const t = (day - maturity.startDay) / (maturity.endDay - maturity.startDay);
    const decay = 1 - t * 0.6;
    return decay * 100;
  }

  return 20;
}

export function getPhaseEmoji(phaseName: string): string {
  const map: Record<string, string> = {
    resting: "⏳",
    prepeak: "🌱",
    peak: "✨",
    maturity: "🍂",
  };
  return map[phaseName] || "☕";
}

export function getPhaseColor(phaseName: string): string {
  const map: Record<string, string> = {
    resting: "#9CA3AF",
    prepeak: "#FCD34D",
    peak: "#10B981",
    maturity: "#F59E0B",
  };
  return map[phaseName] || "#6B7280";
}

export function getDaysUntilNextPhase(result: CurveResult): number | null {
  const current = result.currentPhase;
  const nextIdx = result.phases.findIndex((p) => p.name === current.name) + 1;
  if (nextIdx >= result.phases.length) return null;
  return result.phases[nextIdx].startDay - result.day;
}

export function getPhaseDescription(result: CurveResult): string {
  const phase = result.currentPhase;
  const nextDays = getDaysUntilNextPhase(result);

  let desc = phase.description;

  if (phase.name === "resting") {
    const remaining = phase.endDay - result.day;
    desc = `Dinlenme sürecinde — ${remaining} gün sonra pre-zirve başlayacak.`;
  } else if (phase.name === "prepeak") {
    if (nextDays !== null) {
      desc = `Açılmaya başladı! Yaklaşık ${nextDays} gün sonra zirveye ulaşacak.`;
    }
  } else if (phase.name === "peak") {
    if (nextDays !== null) {
      desc = `🔥 Zirvede! Bu mükemmel içim aralığı yaklaşık ${nextDays} gün daha sürecek.`;
    } else {
      desc = `🔥 Zirvede! Şu an en iyi içim zamanı.`;
    }
  } else if (phase.name === "maturity") {
    desc = `Olgunluk evresinde — hâlâ keyifli ama zirve geride kaldı.`;
  }

  return desc;
}
