import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/loyalty";

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId gerekli" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, loyalty: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const warnings: string[] = [];
  if (user.loyalty && user.loyalty.points < 0) {
    warnings.push(
      `Bu kullanıcı geçmiş siparişinden kazandığı krediyi harcamıştır. Güncel bakiye eksidedir (${(user.loyalty.points / 100).toFixed(2)} TL). İade yaparken ödeme panelinden kesinti yapmayı unutmayınız.`
    );
  }

  const riskyTxns = await prisma.loyaltyTransaction.count({
    where: {
      userId,
      type: "earn",
      status: "refunded",
      note: { contains: "İADE" },
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
  });
  if (riskyTxns > 2) {
    warnings.push(
      `Bu kullanıcı son 90 günde ${riskyTxns} kez iade yapmıştır. Suistimal riskine karşı siparişleri manuel inceleyiniz.`
    );
  }

  return NextResponse.json({ ...user, warnings });
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { userId, action, amount, reference } = await req.json();

  if (!userId || !action || !amount) {
    return NextResponse.json({ error: "userId, action ve amount gerekli" }, { status: 400 });
  }

  try {
    if (action === "award") {
      const awarded = await awardPoints(userId, Math.round(amount), "earn", reference || "Admin manuel yükleme");
      return NextResponse.json({ success: true, points: awarded });
    }

    if (action === "deduct") {
      const loyalty = await prisma.userLoyalty.findUnique({ where: { userId } });
      if (!loyalty) {
        return NextResponse.json({ error: "Kullanıcının Çekirdek Kredi kaydı yok" }, { status: 400 });
      }

      const dedAmount = Math.abs(Math.round(amount));
      const actualDed = Math.min(dedAmount, loyalty.points);

      await prisma.loyaltyTransaction.create({
        data: {
          userId,
          loyaltyId: loyalty.id,
          amount: -actualDed,
          type: "earn",
          status: "refunded",
          note: reference || "Admin manuel silme",
        },
      });

      await prisma.userLoyalty.update({
        where: { userId },
        data: { points: { decrement: actualDed } },
      });

      return NextResponse.json({ success: true, deducted: actualDed });
    }

    if (action === "reset") {
      await prisma.userLoyalty.update({
        where: { userId },
        data: { points: 0, pendingPoints: 0 },
      });
      await prisma.loyaltyTransaction.updateMany({
        where: { userId, status: { in: ["pending", "available"] } },
        data: { status: "refunded", note: "Admin sıfırlama" },
      });
      return NextResponse.json({ success: true, message: "Kredi bakiyesi sıfırlandı" });
    }

    return NextResponse.json({ error: "Geçersiz action (award | deduct | reset)" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
