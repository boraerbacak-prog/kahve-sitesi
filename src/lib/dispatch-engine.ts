import { getFreshnessProfile } from "./freshness-data";

export type BrewMethod = "filter" | "espresso" | "french-press" | "turkish" | "cold-brew";

interface DispatchInput {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  brewMethod?: BrewMethod | string | null;
  transitDays?: number;
  targetDate?: Date;
  roastedAt?: Date | null;
}

export interface DispatchResult {
  roastDate: Date;
  shipDate: Date;
  arrivalDate: Date;
  deliveryDay: number;
  peakStartDay: number;
  peakEndDay: number;
  freshnessAtArrival: number;
  daysUntilPeak: number;
  isPeakOnArrival: boolean;
  recommendation: string;
}

const BREW_OFFSETS: Record<BrewMethod, { shipOffset: number; label: string }> = {
  "filter":       { shipOffset: 0, label: "Filtre Kahve" },
  "espresso":     { shipOffset: 1, label: "Espresso" },
  "french-press": { shipOffset: 0, label: "French Press" },
  "turkish":      { shipOffset: 2, label: "Türk Kahvesi" },
  "cold-brew":    { shipOffset: -3, label: "Soğuk Demleme" },
};

export function calculateDispatch(input: DispatchInput, today: Date = new Date()): DispatchResult {
  const profile = getFreshnessProfile(input);
  const phases = profile.phases;

  const peakPhase = phases.find((p) => p.name === "peak")!;
  const restingPhase = phases.find((p) => p.name === "resting")!;
  const peakStartDay = peakPhase.startDay;
  const peakEndDay = peakPhase.endDay;

  const brewMethod = (input.brewMethod || "filter") as BrewMethod;
  const brewConfig = BREW_OFFSETS[brewMethod] || BREW_OFFSETS.filter;
  const transitDays = input.transitDays ?? 2;

  const targetDate = input.targetDate || today;

  const existingRoast = input.roastedAt ? new Date(input.roastedAt) : null;

  let roastDate: Date;
  let shipDate: Date;

  if (brewMethod === "espresso") {
    const shipOffset = brewConfig.shipOffset;
    shipDate = new Date(targetDate);
    shipDate.setDate(shipDate.getDate() + shipOffset);
    roastDate = new Date(shipDate);
    roastDate.setDate(roastDate.getDate() - 1);
  } else if (brewMethod === "cold-brew") {
    const coldOffset = 3;
    shipDate = new Date(targetDate);
    shipDate.setDate(shipDate.getDate() + coldOffset);
    roastDate = new Date(shipDate);
    roastDate.setDate(roastDate.getDate() - (peakStartDay - transitDays - 7));
  } else {
    const desiredArrivalDay = peakStartDay;
    shipDate = new Date(targetDate);
    shipDate.setDate(shipDate.getDate() - transitDays);
    const daysAfterRoastToShip = desiredArrivalDay - transitDays;
    roastDate = new Date(shipDate);
    roastDate.setDate(roastDate.getDate() - daysAfterRoastToShip);
    if (roastDate < today) {
      roastDate = new Date(today);
      shipDate = new Date(roastDate);
      shipDate.setDate(shipDate.getDate() + daysAfterRoastToShip);
    }
  }

  const arrivalDate = new Date(shipDate);
  arrivalDate.setDate(arrivalDate.getDate() + transitDays);

  const daysSinceRoast = existingRoast
    ? Math.floor((today.getTime() - existingRoast.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const deliveryDay = existingRoast
    ? daysSinceRoast + transitDays
    : Math.floor((arrivalDate.getTime() - roastDate.getTime()) / (1000 * 60 * 60 * 24));

  const freshnessAtArrival = calculateFreshnessAtDay(deliveryDay, peakStartDay, peakEndDay, restingPhase.endDay);

  const daysUntilPeak = Math.max(0, peakStartDay - deliveryDay);
  const isPeakOnArrival = deliveryDay >= peakStartDay && deliveryDay <= peakEndDay;

  const recommendation = buildRecommendation(
    brewMethod, deliveryDay, peakStartDay, peakEndDay, isPeakOnArrival, freshnessAtArrival, transitDays
  );

  return {
    roastDate,
    shipDate,
    arrivalDate,
    deliveryDay,
    peakStartDay,
    peakEndDay,
    freshnessAtArrival,
    daysUntilPeak,
    isPeakOnArrival,
    recommendation,
  };
}

function calculateFreshnessAtDay(day: number, peakStart: number, peakEnd: number, restEnd: number): number {
  if (day <= restEnd) {
    return (day / restEnd) * 50;
  }
  if (day < peakStart) {
    const t = (day - restEnd) / (peakStart - restEnd);
    return 50 + t * 45;
  }
  if (day <= peakEnd) {
    const mid = (peakStart + peakEnd) / 2;
    const halfRange = (peakEnd - peakStart) / 2;
    const dist = Math.abs(day - mid) / halfRange;
    return 100 - dist * dist * 10;
  }
  return Math.max(20, 100 - ((day - peakEnd) / 10) * 40);
}

function buildRecommendation(
  brewMethod: string, deliveryDay: number, peakStart: number, peakEnd: number,
  isPeak: boolean, freshness: number, transitDays: number
): string {
  if (isPeak) {
    return "🔥 Zirvede teslim! Kutuyu açar açmaz demlemeye başlayabilirsiniz.";
  }
  if (deliveryDay < peakStart) {
    const waitDays = peakStart - deliveryDay;
    if (waitDays <= 2) {
      return `🚀 ${waitDays} gün sonra zirvede! ${waitDays === 1 ? "Yarın" : waitDays + " gün içinde"} mükemmel demleme zamanı.`;
    }
    return `⏳ Dinleniyor — ${waitDays} gün sabredin, zirve lezzet sizi bekliyor.`;
  }
  return `🍂 Olgunluk evresinde teslim — hâlâ keyifli, ama bir sonraki gönderimde zirveyi yakalayacağız.`;
}

export function getSubscriptionTier(product: { origin?: string | null; process?: string | null; roastLevel?: string | null }): {
  tier: string;
  tierLabel: string;
  tierBadge: string;
  description: string;
} {
  const profile = getFreshnessProfile(product);
  const phases = profile.phases;
  const peakStart = phases.find((p) => p.name === "peak")!.startDay;

  if (peakStart <= 8) {
    return {
      tier: "daily",
      tierLabel: "Günlük İçim",
      tierBadge: "Klasik",
      description: "Hızlı açılan, stabil profilli — konforlu günlük kahve keyfi.",
    };
  }
  if (peakStart <= 14) {
    return {
      tier: "explorer",
      tierLabel: "Nitelikli Avcı",
      tierBadge: "Özel Seçki",
      description: "Sabır isteyen, zirveye ulaştığında benzersiz tatlar sunan kompleks kahveler.",
    };
  }
  return {
    tier: "collector",
    tierLabel: "Koleksiyoner",
    tierBadge: "Sınırlı",
    description: "Nadir çekirdekler, uzun dinlenme, unutulmaz lezzet yolculuğu.",
  };
}

export function calculateNextDeliveryDates(
  subscription: {
    startDate: Date;
    deliveryFrequency: string;
    brewMethod?: string | null;
    packageCount?: number | null;
  },
  products: { origin?: string | null; process?: string | null; roastLevel?: string | null }[],
  today: Date = new Date()
): {
  nextRoastDate: Date;
  nextShipDate: Date;
  nextArrivalDate: Date;
  deliveryDay: number;
  freshnessScore: number;
  isPeak: boolean;
  recommendation: string;
}[] {
  const freqMonths = subscription.deliveryFrequency === "weekly" ? 0.25 : 1;
  const result: any[] = [];

  const numDeliveries = 3;
  for (let i = 0; i < numDeliveries; i++) {
    const baseDate = new Date(today);
    baseDate.setMonth(baseDate.getMonth() + Math.floor(i * freqMonths));

    const dispatch = calculateDispatch({
      ...products[0],
      brewMethod: subscription.brewMethod,
    }, baseDate);

    result.push({
      nextRoastDate: dispatch.roastDate,
      nextShipDate: dispatch.shipDate,
      nextArrivalDate: dispatch.arrivalDate,
      deliveryDay: dispatch.deliveryDay,
      freshnessScore: dispatch.freshnessAtArrival,
      isPeak: dispatch.isPeakOnArrival,
      recommendation: dispatch.recommendation,
    });
  }

  return result;
}
