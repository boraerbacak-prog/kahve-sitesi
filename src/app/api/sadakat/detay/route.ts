import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ROST-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const userId = session.user.id;

  const loyalty = await prisma.userLoyalty.findUnique({ where: { userId } });
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  // Kullanıcının referans kodu yoksa otomatik oluştur
  if (!user?.referralCode) {
    let code = generateReferralCode();
    let attempts = 0;
    while (await prisma.user.findUnique({ where: { referralCode: code } })) {
      code = generateReferralCode();
      attempts++;
      if (attempts > 10) {
        code = `ROST-${Date.now().toString(36).toUpperCase()}`;
        break;
      }
    }
    await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
    user = { referralCode: code };
  }

  const txns = await prisma.loyaltyTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Aylık kazanım
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyTxns = await prisma.loyaltyTransaction.findMany({
    where: {
      userId,
      type: "earn",
      status: { in: ["pending", "available"] },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true },
  });
  const settings = await prisma.loyaltySettings.findUnique({ where: { id: "global" } });
  const MONTHLY_CAP_KURUS = settings?.monthlyCapKurus || 150000;
  const monthlyEarned = monthlyTxns.reduce((s, t) => s + t.amount, 0);

  // Referans istatistikleri
  const referralCount = await prisma.referral.count({
    where: { referrerId: userId },
  });
  const referralPending = await prisma.referral.count({
    where: { referrerId: userId, status: "pending" },
  });

  return NextResponse.json({
    availableTL: (loyalty?.points || 0) / 100,
    pendingTL: (loyalty?.pendingPoints || 0) / 100,
    totalSpent: loyalty?.totalSpent || 0,
    earnRate: 5,
    monthlyEarnedTL: monthlyEarned / 100,
    monthlyCapTL: MONTHLY_CAP_KURUS / 100,
    monthlyCapKurus: MONTHLY_CAP_KURUS,
    monthlyProgressPct: Math.min(100, Math.round((monthlyEarned / MONTHLY_CAP_KURUS) * 100)),
    referralCode: user.referralCode,
    referralTotal: referralCount,
    referralPending,
    transactions: txns,
  });
}
