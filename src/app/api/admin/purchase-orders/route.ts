import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ purchaseOrders: orders });
}

export async function POST(req: Request) {
  const { supplierId, notes, items } = await req.json();

  const total = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);

  const order = await prisma.purchaseOrder.create({
    data: {
      supplierId,
      notes,
      total,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: { supplier: true, items: { include: { product: true } } },
  });
  return NextResponse.json({ purchaseOrder: order });
}

export async function PUT(req: Request) {
  const { id, status, notes } = await req.json();
  const data: Record<string, any> = {};
  if (status) data.status = status;
  if (notes !== undefined) data.notes = notes;

  const order = await prisma.purchaseOrder.update({
    where: { id },
    data,
    include: { supplier: true, items: { include: { product: true } } },
  });
  return NextResponse.json({ purchaseOrder: order });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.purchaseOrder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
