export function getBrewMethods(
  origin: string | null,
  process: string | null,
  roastLevel: string | null,
  body: string | null,
): string[] {
  const methods = new Set<string>();

  if (process) {
    const p = process.toLowerCase();
    if (p.includes("washed") || p.includes("yıkanmış")) {
      methods.add("V60"); methods.add("Chemex"); methods.add("Pour Over");
    } else if (p.includes("natural") || p.includes("doğal")) {
      methods.add("Espresso"); methods.add("French Press"); methods.add("Moka Pot");
    } else if (p.includes("honey") || p.includes("bal")) {
      methods.add("V60"); methods.add("Aeropress"); methods.add("Chemex");
    } else if (p.includes("semi") || p.includes("wet") || p.includes("yarı")) {
      methods.add("Espresso"); methods.add("Filter");
    }
  }

  if (roastLevel) {
    const r = roastLevel.toLowerCase();
    if (r === "light") {
      methods.add("V60"); methods.add("Chemex"); methods.add("Pour Over");
    } else if (r === "medium") {
      methods.add("Aeropress"); methods.add("V60"); methods.add("Espresso");
    } else if (r === "dark") {
      methods.add("Espresso"); methods.add("Moka Pot"); methods.add("French Press");
    }
  }

  if (origin) {
    const o = origin.toLowerCase();
    if (o.includes("ethiopia") || o.includes("etiyopya") || o.includes("kenya") || o.includes("africa")) {
      methods.add("V60"); methods.add("Chemex");
    } else if (o.includes("brasil") || o.includes("brazil") || o.includes("brezilya") || o.includes("colombia") || o.includes("kolombiya") || o.includes("guatemala")) {
      methods.add("V60"); methods.add("Espresso");
    } else if (o.includes("sumatra") || o.includes("java") || o.includes("indonesia")) {
      methods.add("French Press"); methods.add("Espresso");
    }
  }

  if (body) {
    const b = body.toLowerCase();
    if (b.includes("full") || b.includes("dolgun")) {
      methods.add("Espresso"); methods.add("French Press");
    } else if (b.includes("light") || b.includes("hafif")) {
      methods.add("V60"); methods.add("Chemex");
    }
  }

  return [...methods].slice(0, 4);
}

export const brewMethodIcons: Record<string, string> = {
  V60: "💧",
  Chemex: "🧪",
  "Pour Over": "☕",
  Espresso: "🔴",
  "French Press": "🫗",
  "Moka Pot": "🫖",
  Aeropress: "💨",
  Filter: "🫗",
};
