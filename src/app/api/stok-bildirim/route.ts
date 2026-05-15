import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notifications = await prisma.stockNotification.findMany({
    include: { product: { select: { id: true, name: true, slug: true, stock: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  const { email, productId } = await req.json();
  if (!email || !productId) return NextResponse.json({ error: "email and productId required" }, { status: 400 });
  await prisma.stockNotification.create({
    data: { email, productId },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.stockNotification.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
