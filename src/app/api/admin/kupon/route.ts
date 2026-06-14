import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const data = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      discountPct: data.discountPct || 0,
      discountLira: data.discountLira || 0,
      minAmount: data.minAmount || 0,
      maxUses: data.maxUses || 0,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  return NextResponse.json({ success: true, coupon });
}

export async function PUT(req: Request) {
  const data = await req.json();
  await prisma.coupon.update({
    where: { id: data.id },
    data: {
      code: data.code.toUpperCase(),
      discountPct: data.discountPct,
      discountLira: data.discountLira,
      minAmount: data.minAmount,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive,
    },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
