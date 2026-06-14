import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/loyalty";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expired = await prisma.loyaltyTransaction.findMany({
    where: {
      type: "earn",
      status: "pending",
      availableAt: { lte: now },
    },
  });

  let released = 0;
  let referralAwarded = 0;
  const processedUsers = new Set<string>();

  for (const txn of expired) {
    await prisma.loyaltyTransaction.update({
      where: { id: txn.id },
      data: { status: "available" },
    });

    await prisma.userLoyalty.update({
      where: { userId: txn.userId },
      data: {
        pendingPoints: { decrement: txn.amount },
        points: { increment: txn.amount },
      },
    });
    released++;

    // Referans ödülü: arkadaşın iade süresi dolduktan sonra (14 gün) davet edene kredi yükle
    if (!processedUsers.has(txn.userId)) {
      processedUsers.add(txn.userId);
      const referral = await prisma.referral.findFirst({
        where: { refereeId: txn.userId, status: "pending" },
      });
      if (referral) {
        const settings = await prisma.loyaltySettings.findUnique({ where: { id: "global" } });
        const points = settings?.referralRewardKurus || 10000;
        await awardPoints(referral.referrerId, points, "referral", "Arkadaşın ilk alışverişini tamamladı!");
        await prisma.referral.update({
          where: { id: referral.id },
          data: { status: "rewarded", rewardedAt: new Date() },
        });
        referralAwarded++;
      }
    }
  }

  return NextResponse.json({ released, referralAwarded, total: expired.length });
}
