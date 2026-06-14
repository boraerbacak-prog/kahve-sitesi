import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code, total } = await req.json();
  if (!code) return NextResponse.json({ error: "Kupon kodu gerekli" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) return NextResponse.json({ error: "Geçersiz kupon kodu" }, { status: 400 });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ error: "Kupon süresi dolmuş" }, { status: 400 });
  if (coupon.maxUses > 0 && coupon.useCount >= coupon.maxUses) return NextResponse.json({ error: "Kupon kullanım limiti dolmuş" }, { status: 400 });
  if (total < coupon.minAmount) return NextResponse.json({ error: `Minimum ${coupon.minAmount} ₺ alışveriş gerekli` }, { status: 400 });

  return NextResponse.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountPct: coupon.discountPct,
      discountLira: coupon.discountLira,
    },
  });
}
