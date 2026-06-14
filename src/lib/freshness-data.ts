export type OriginGroup = "africa" | "americas" | "asia-pacific";
export type ProcessGroup = "washed" | "natural" | "honey" | "wet-hulled";
export type RoastKey = "light" | "medium" | "dark";

export interface PhaseDef {
  name: string;
  nameTr: string;
  description: string;
  startDay: number;
  endDay: number;
  flavorNote: string;
}

export interface FreshnessProfile {
  origin: OriginGroup;
  process: ProcessGroup;
  roast: RoastKey;
  phases: PhaseDef[];
}

function classifyOrigin(origin?: string | null): OriginGroup {
  if (!origin) return "americas";
  const o = origin.toLowerCase();
  if (o.includes("ethiopia") || o.includes("etiyopya") || o.includes("kenya") || o.includes("ruanda") || o.includes("burundi") || o.includes("tanzanya")) return "africa";
  if (o.includes("endonezya") || o.includes("sumatra") || o.includes("java") || o.includes("papua") || o.includes("vietnam")) return "asia-pacific";
  return "americas";
}

function classifyProcess(process?: string | null): ProcessGroup {
  if (!process) return "washed";
  const p = process.toLowerCase();
  if (p.includes("natural") || p.includes("doğal")) return "natural";
  if (p.includes("honey") || p.includes("ballı") || p.includes("yarı")) return "honey";
  if (p.includes("wet") || p.includes("giling") || p.includes("sulfu")) return "wet-hulled";
  return "washed";
}

function getPhases(origin: OriginGroup, process: ProcessGroup, roast: RoastKey): PhaseDef[] {
  const base = getBaseDays(origin, process, roast);
  return [
    {
      name: "resting",
      nameTr: "Dinlenme",
      description: `Kahve kavurma sonrası CO₂ salınımını tamamlıyor. Henüz içime hazır değil — sabırlı olun.`,
      startDay: 0,
      endDay: base.restEnd,
      flavorNote: "Gazlı, kapalı aroma, henüz oturmamış",
    },
    {
      name: "prepeak",
      nameTr: "Pre-zirve",
      description: `Kahve açılmaya başladı ama henüz tam potansiyelinde değil. Karakter sinyalleri vermeye başlıyor.`,
      startDay: base.restEnd,
      endDay: base.peakStart,
      flavorNote: "Aromalar belirmeye başlıyor, henüz dengede değil",
    },
    {
      name: "peak",
      nameTr: "Zirve",
      description: `Mükemmel içim aralığı! Tüm aroma notaları, asidite ve gövde kusursuz uyum içinde.`,
      startDay: base.peakStart,
      endDay: base.peakEnd,
      flavorNote: "Full aroma, dengeli, en yüksek lezzet performansı",
    },
    {
      name: "maturity",
      nameTr: "Olgunluk",
      description: `Zirve geçti ama kahve hâlâ keyifli. Daha sakin, yuvarlak bir profil sunar.`,
      startDay: base.peakEnd,
      endDay: base.maturityEnd,
      flavorNote: "Yumuşamış asidite, düzleşen aroma, hâlâ içilebilir",
    },
  ];
}

interface DayRanges {
  restEnd: number;
  peakStart: number;
  peakEnd: number;
  maturityEnd: number;
}

function getBaseDays(origin: OriginGroup, _process: ProcessGroup, roast: RoastKey): DayRanges {
  const restOffset = roast === "light" ? 0 : roast === "medium" ? -3 : -6;
  const peakDuration = origin === "africa" ? 18 : origin === "americas" ? 22 : 26;
  const restBase = roast === "light" ? 16 : roast === "medium" ? 12 : 8;
  const restEnd = Math.max(restBase + restOffset, 4);
  const peakStart = restEnd + (roast === "light" ? 6 : 4);
  const peakEnd = peakStart + peakDuration;
  const maturityEnd = peakEnd + (origin === "africa" ? 18 : 24);
  return { restEnd, peakStart, peakEnd, maturityEnd };
}

export function getFreshnessProfile(product: {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
}): FreshnessProfile {
  const origin = classifyOrigin(product.origin);
  const process = classifyProcess(product.process);
  const roast = (product.roastLevel as RoastKey) || "medium";
  const phases = getPhases(origin, process, roast);
  return { origin, process, roast, phases };
}

export function getOriginLabel(origin: OriginGroup): string {
  const labels: Record<OriginGroup, string> = {
    africa: "Afrika",
    americas: "Amerika",
    "asia-pacific": "Asya/Pasifik",
  };
  return labels[origin];
}

export function getProcessLabel(process: ProcessGroup): string {
  const labels: Record<ProcessGroup, string> = {
    washed: "Yıkanmış",
    natural: "Doğal",
    honey: "Ballı (Honey)",
    "wet-hulled": "Islak Kabuk (Giling Basah)",
  };
  return labels[process];
}

export function getRoastLabel(roast: RoastKey): string {
  const labels: Record<RoastKey, string> = {
    light: "Zarif",
    medium: "İdeal",
    dark: "Karakterli",
  };
  return labels[roast];
}
