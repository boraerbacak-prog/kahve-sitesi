import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });

  if (!user?.referralCode) {
    return NextResponse.json({ error: "Referans kodunuz bulunamadı" }, { status: 400 });
  }

  // İstatistikler
  const pendingCount = await prisma.referral.count({
    where: { referrerId: session.user.id, status: "pending" },
  });
  const rewardedCount = await prisma.referral.count({
    where: { referrerId: session.user.id, status: "rewarded" },
  });

  return NextResponse.json({
    referralCode: user.referralCode,
    pendingCount,
    rewardedCount,
    inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rostello.com.tr"}/kayit?ref=${user.referralCode}`,
  });
}
