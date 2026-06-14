import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [memberCount, pointsAgg, spentAgg] = await Promise.all([
    prisma.userLoyalty.count(),
    prisma.userLoyalty.aggregate({ _sum: { points: true } }),
    prisma.userLoyalty.aggregate({ _sum: { totalSpent: true } }),
  ]);

  return NextResponse.json({
    memberCount,
    totalPoints: pointsAgg._sum.points || 0,
    totalSpent: spentAgg._sum.totalSpent || 0,
  });
}
