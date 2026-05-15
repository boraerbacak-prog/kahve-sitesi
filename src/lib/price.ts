export function formatPrice(price: number | string | undefined | null): string {
  const n = typeof price === "number" ? price : Number(price) || 0;
  return Math.round(n).toLocaleString("tr-TR");
}

export function formatPriceWithUnit(price: number | string | undefined | null, unit = "₺"): string {
  return `${formatPrice(price)} ${unit}`;
}

export function kgTo250g(kgPrice: number): number {
  return kgPrice * 0.25;
}

