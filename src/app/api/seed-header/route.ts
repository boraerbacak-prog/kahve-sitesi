import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // Remove old flat header items
  const oldHeader = await prisma.menuItem.findMany({ where: { group: "header", parentId: null } });
  for (const item of oldHeader) {
    await prisma.menuItem.deleteMany({ where: { parentId: item.id } });
    await prisma.menuItem.delete({ where: { id: item.id } });
    results.push(`Deleted: ${item.label}`);
  }

  // Create Dükkan with children
  const dukkan = await prisma.menuItem.create({
    data: { label: "Dükkan", href: "/urunler", group: "header", sortOrder: 1 },
  });
  await prisma.menuItem.create({ data: { label: "Kahveler", href: "/urunler", parentId: dukkan.id, group: "header", sortOrder: 1 } });
  await prisma.menuItem.create({ data: { label: "Ekipmanlar", href: "/ekipmanlar", parentId: dukkan.id, group: "header", sortOrder: 2 } });
  await prisma.menuItem.create({ data: { label: "İmza Ürünler", href: "/imza-urunler", parentId: dukkan.id, group: "header", sortOrder: 3 } });
  results.push("Dükkan + children created");

  // Other header links
  const links = [
    { label: "Kahve Aboneliği", href: "/abonelik", sortOrder: 2 },
    { label: "Çekirdek Hesap", href: "/sadakat", sortOrder: 3 },
    { label: "Kavurumhane", href: "/kavurma-dukkani", sortOrder: 4 },
    { label: "Damak Testi", href: "/damak-testi", sortOrder: 5 },
  ];
  for (const link of links) {
    await prisma.menuItem.create({ data: { ...link, group: "header" } });
    results.push(`Header: ${link.label}`);
  }

  return NextResponse.json({ message: "Header reset complete", results });
}
