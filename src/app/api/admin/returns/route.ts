import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const returns = await prisma.returnRequest.findMany({
    include: {
      order: {
        include: { user: true, items: { include: { product: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ returns });
}

export async function PUT(req: Request) {
  const { id, status, cargoCompany, trackingNumber, notes } = await req.json();
  const data: Record<string, any> = {};
  if (status) data.status = status;
  if (cargoCompany !== undefined) data.cargoCompany = cargoCompany;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (notes !== undefined) data.notes = notes;

  const returnReq = await prisma.returnRequest.update({
    where: { id },
    data,
    include: {
      order: { include: { user: true, items: { include: { product: true } } } },
    },
  });
  return NextResponse.json({ return: returnReq });
}
