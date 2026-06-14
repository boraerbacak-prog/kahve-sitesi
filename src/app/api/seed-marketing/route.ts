import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  const bestSellerSlugs = ["ethiopia-sidamo-g2", "colombia-supremo-18-sc", "brasil-mogiana", "guatemala-shb-18-sc"];
  const newArrivalSlugs = ["colombia-la-roca-pink-bourbon", "ethiopia-yirga-koke-honey-g1", "ethiopia-lekempt-g4", "ethiopia-sidamo-g4"];

  await prisma.product.updateMany({ data: { isBestSeller: false, isNewArrival: false } });
  results.push("Reset all flags");

  const best = await prisma.product.updateMany({ where: { slug: { in: bestSellerSlugs } }, data: { isBestSeller: true } });
  results.push(`Marked ${best.count} products as best seller`);

  const newArr = await prisma.product.updateMany({ where: { slug: { in: newArrivalSlugs } }, data: { isNewArrival: true } });
  results.push(`Marked ${newArr.count} products as new arrival`);

  return NextResponse.json({ message: "Done", results });
}
