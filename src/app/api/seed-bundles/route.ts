import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  let cat = await prisma.category.findFirst({ where: { slug: "tadim-paketi" } });
  if (!cat) {
    cat = await prisma.category.create({
      data: { name: "Tadım Paketi", slug: "tadim-paketi" },
    });
  }

  const bundles = [
    {
      name: "Standart Tadım Paketi",
      slug: "standart-tadim-paketi",
      description: "Giriş seviye kahvelerle tadım yolculuğuna başlayın. Her kahveden ~83g, toplam 250g. Yaklaşık 15 brew.",
      price: 750,
      stock: 50,
      weight: 250,
      origin: "Brezilya, Kolombiya, Guatemala",
      roastLevel: "medium",
      flavorNotes: JSON.stringify(["Brasil Mogiana", "Colombia Supremo 18 SC", "Guatemala SHB"]),
      segment: "bundle",
      featured: true,
      published: true,
      categoryId: cat.id,
    },
    {
      name: "Orta Tadım Paketi",
      slug: "orta-tadim-paketi",
      description: "Dengeli ve aromatik kahvelerle bir adım öteye. Her kahveden ~83g, toplam 250g. Yaklaşık 15 brew.",
      price: 750,
      stock: 50,
      weight: 250,
      origin: "Etiyopya, Kolombiya",
      roastLevel: "medium",
      flavorNotes: JSON.stringify(["Ethiopia Sidamo G2", "Ethiopia Yirga Koke Honey G1", "Colombia La Roca Pink Bourbon"]),
      segment: "bundle",
      featured: true,
      published: true,
      categoryId: cat.id,
    },
    {
      name: "Üst Damak Tadım Paketi",
      slug: "ust-damak-tadim-paketi",
      description: "Premium tek köken kahvelerle gerçek bir deneyim. Her kahveden ~83g, toplam 250g. Yaklaşık 15 brew.",
      price: 750,
      stock: 50,
      weight: 250,
      origin: "Kenya, Panama, Yemen",
      roastLevel: "light",
      flavorNotes: JSON.stringify(["Kenya AA", "Panama Geisha", "Yemen Mocha"]),
      segment: "bundle",
      featured: true,
      published: true,
      categoryId: cat.id,
    },
  ];

  const results: string[] = [];
  for (const b of bundles) {
    const existing = await prisma.product.findUnique({ where: { slug: b.slug } });
    if (existing) {
      await prisma.product.delete({ where: { slug: b.slug } });
      results.push(`Deleted old: ${b.name}`);
    }
    await prisma.product.create({ data: b });
    results.push(`Created: ${b.name}`);
  }

  return NextResponse.json({ message: "Done", results });
}
