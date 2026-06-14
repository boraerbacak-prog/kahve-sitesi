import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("items")?.split(",").filter(Boolean) || [];
  const total = parseFloat(req.nextUrl.searchParams.get("total") || "0");
  const SHIPPING_THRESHOLD = 1000;

  if (ids.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const cartProducts = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, category: { select: { type: true } }, origin: true },
  });

  const hasKahve = cartProducts.some(p => p.category.type === "kahve");
  const hasEquipment = cartProducts.some(p => p.category.type === "ekipman");
  const hasImzaCart = cartProducts.some(p => p.category.type === "imza");
  const shippingGap = Math.max(0, SHIPPING_THRESHOLD - total);

  const seen = new Set<string>();
  const result: { id: string; name: string; slug: string; price: number; salePrice?: number | null; origin?: string | null; image?: string | null; type: "product" | "equipment" | "signature"; _priority: number }[] = [];

  function add(p: { id: string; name: string; slug: string; price: number; origin?: string | null; image?: string | null; salePrice?: number | null }, type: "product" | "equipment" | "signature", priority: number) {
    if (seen.has(p.id)) return;
    seen.add(p.id);
    result.push({ ...p, type, _priority: priority });
  }

  // Sepette ne varsa onun dışındaki kategorilerden doldur
  const allTypes: ("kahve" | "ekipman" | "imza")[] = ["kahve", "ekipman", "imza"];
  const missingTypes = allTypes.filter(t =>
    t === "kahve" ? !hasKahve : t === "ekipman" ? !hasEquipment : !hasImzaCart
  );

  for (const missingType of missingTypes) {
    if (result.length >= 12) break;
    if (missingType === "kahve") {
      const kahves = await prisma.product.findMany({
        where: { published: true, status: { not: "archived" }, id: { notIn: ids } },
        select: { id: true, name: true, slug: true, price: true, origin: true },
        take: 4,
        orderBy: { featured: "desc" },
      });
      for (const p of kahves) { add(p, "product", 1); }
    }
    if (missingType === "ekipman") {
      const equip = await prisma.equipment.findMany({
        where: { published: true, soldOut: false },
        select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true },
        take: 4,
      });
      for (const e of equip) { add(e, "equipment", 1); }
    }
    if (missingType === "imza") {
      const imzas = await prisma.signatureProduct.findMany({
        where: { published: true },
        select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true },
        take: 4,
      });
      for (const s of imzas) { add({ ...s, origin: null }, "signature", 1); }
    }
  }

  // Kargo açığına uygun ürünler
  if (shippingGap > 0 && result.length < 12) {
    for (const p of await prisma.product.findMany({
      where: { published: true, status: { not: "archived" }, id: { notIn: ids }, price: { lte: shippingGap } },
      select: { id: true, name: true, slug: true, price: true, origin: true },
      take: 3,
    })) { add(p, "product", 2); }

    for (const e of await prisma.equipment.findMany({
      where: { published: true, soldOut: false },
      select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true },
      take: 3,
    })) {
      const effectivePrice = e.salePrice || e.price;
      if (effectivePrice <= shippingGap) add(e, "equipment", 2);
    }
  }

  // Popüler / featured ürünlerle doldur
  if (result.length < 8) {
    for (const p of await prisma.product.findMany({
      where: { published: true, status: { not: "archived" }, id: { notIn: ids } },
      select: { id: true, name: true, slug: true, price: true, origin: true },
      take: 6,
      orderBy: { featured: "desc" },
    })) { add(p, "product", 3); }

    for (const e of await prisma.equipment.findMany({
      where: { published: true, soldOut: false },
      select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true },
      take: 4,
    })) { add(e, "equipment", 3); }

    for (const s of await prisma.signatureProduct.findMany({
      where: { published: true },
      select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true },
      take: 4,
    })) { add({ ...s, origin: null }, "signature", 3); }
  }

  // Karıştır (shuffle)
  const shuffled = result
    .sort(() => Math.random() - 0.5)
    .slice(0, 12)
    .map(({ _priority, ...rest }) => rest);

  return NextResponse.json({ items: shuffled });
}
