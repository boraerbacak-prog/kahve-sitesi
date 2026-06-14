import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/loyalty";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    // Bu kullanıcı bir referansla mı kaydolmuş?
    const referral = await prisma.referral.findFirst({
      where: { refereeId: userId, status: "pending" },
      include: { referrer: true },
    });

    if (!referral) {
      return NextResponse.json({ error: "Bu kullanıcı için bekleyen referans bulunamadı" }, { status: 400 });
    }

    // Referans verene 100 TL Çekirdek Kredi
    await awardPoints(referral.referrerId, 10000, "referral", `Arkadaşın ilk alışverişini yaptı!`);

    // Referans kaydını güncelle
    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: "rewarded", rewardedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
