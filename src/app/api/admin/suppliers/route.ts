import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { purchaseOrders: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ suppliers });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supplier = await prisma.supplier.create({ data: body });
  return NextResponse.json({ supplier });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const supplier = await prisma.supplier.update({ where: { id }, data });
  return NextResponse.json({ supplier });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.supplier.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
