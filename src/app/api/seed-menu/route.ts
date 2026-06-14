import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = [
    { label: "Kahveler", href: "/urunler", sortOrder: 1 },
    { label: "Kavurma Dükkanı", href: "/kavurma-dukkani", sortOrder: 2 },
    { label: "Ekipmanlar", href: "/ekipmanlar", sortOrder: 3 },
    { label: "İmza Ürünler", href: "/imza-urunler", sortOrder: 4 },
  ];

  const results: string[] = [];
  for (const item of items) {
    const existing = await prisma.menuItem.findFirst({ where: { href: item.href } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
      results.push(`Created: ${item.label}`);
    } else {
      results.push(`Already exists: ${item.label}`);
    }
  }

  return NextResponse.json({ message: "Done", results });
}
