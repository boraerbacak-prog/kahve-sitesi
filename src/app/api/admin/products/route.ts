import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const { name, slug, description, price, compareAt, stock, weight, origin, region, altitude, variety, grade, process, roastLevel, flavorNotes, body, acidity, segment, featured, published, categoryId, roastedAt, isBestSeller, isNewArrival, status, estimatedRoastAt, seasonNote, greenBeanKg } = await req.json();
  const product = await prisma.product.create({
    data: {
      name, slug, description, price, compareAt, stock: stock || 0, weight,
      origin, region, altitude, variety, grade, process, roastLevel,
      flavorNotes: flavorNotes || "[]", body, acidity, segment,
      featured: featured || false, published: published ?? true, categoryId,
      roastedAt: roastedAt ? new Date(roastedAt) : null,
      isBestSeller: isBestSeller || false, isNewArrival: isNewArrival || false,
      status: status || "active",
      estimatedRoastAt: estimatedRoastAt ? new Date(estimatedRoastAt) : null,
      seasonNote, greenBeanKg: greenBeanKg ? parseFloat(greenBeanKg) : null,
    },
  });
  return NextResponse.json({ product });
}

export async function PUT(req: Request) {
  const { id, stockNote, ...data } = await req.json();
  const old = await prisma.product.findUnique({ where: { id }, select: { stock: true, price: true } });
  const product = await prisma.product.update({ where: { id }, data });

  if (old && data.stock !== undefined && old.stock !== data.stock) {
    await prisma.stockLog.create({
      data: { productId: id, oldStock: old.stock, newStock: data.stock, change: data.stock - old.stock, note: stockNote || null },
    });
  }
  if (old && data.price !== undefined && old.price !== data.price) {
    await prisma.priceLog.create({
      data: { productId: id, oldPrice: old.price, newPrice: data.price },
    });
  }

  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
