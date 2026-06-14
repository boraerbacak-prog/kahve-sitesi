import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, walletTransaction: { orderBy: { createdAt: "desc" }, take: 50 } },
    });

    return NextResponse.json({
      balance: user?.walletBalance ?? 0,
      transactions: user?.walletTransaction ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Sunucu hatası: " + (e?.message || "bilinmeyen") }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || amount < 50) return NextResponse.json({ error: "Minimum yükleme 50 TL" }, { status: 400 });
    if (amount > 50000) return NextResponse.json({ error: "Maksimum yükleme 50.000 TL" }, { status: 400 });

    const tx = await prisma.walletTransaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "top_up",
        status: "pending",
        note: "Cüzdana para yükleme talebi",
      },
    });

    return NextResponse.json({
      success: true,
      transaction: tx,
      message: "Yükleme talebiniz alındı. Havale bilgileri: CELSUS KAHVE, TR12 0006 2001 2345 0006 7890, açıklama: WALLET-" + tx.id.slice(0, 8),
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Sunucu hatası: " + (e?.message || "bilinmeyen") }, { status: 500 });
  }
}
