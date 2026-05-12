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
  const { name, slug, description, price, compareAt, stock, weight, origin, region, roastLevel, flavorNotes, body, acidity, segment, featured, published, categoryId } = await req.json();
  const product = await prisma.product.create({
    data: { name, slug, description, price, compareAt, stock: stock || 0, weight, origin, region, roastLevel, flavorNotes: flavorNotes || "[]", body, acidity, segment, featured: featured || false, published: published ?? true, categoryId },
  });
  return NextResponse.json({ product });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
