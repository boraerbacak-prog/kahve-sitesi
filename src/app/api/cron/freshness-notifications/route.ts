import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateFreshness } from "@/lib/flavor-curve";
import { peakReachedEmail, maturityReachedEmail, freshnessEndedEmail } from "@/lib/email";

const PHASE_ORDER = ["resting", "prepeak", "peak", "maturity"];

function getPhaseRank(name: string): number {
  const idx = PHASE_ORDER.indexOf(name);
  return idx >= 0 ? idx : -1;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { roastedAt: { not: null }, status: "active" },
    select: {
      id: true,
      name: true,
      slug: true,
      origin: true,
      process: true,
      roastLevel: true,
      roastedAt: true,
      createdAt: true,
    },
  });

  let peakSent = 0;
  let maturitySent = 0;
  let endSent = 0;

  for (const product of products) {
    const freshness = calculateFreshness(product);
    const currentPhase = freshness.currentPhase.name;
    const day = freshness.day;
    const totalDays = freshness.totalDays;

    const subscriptions = await prisma.freshnessNotification.findMany({
      where: { productId: product.id },
    });

    for (const sub of subscriptions) {
      const lastRank = sub.lastNotifiedPhase ? getPhaseRank(sub.lastNotifiedPhase) : -1;
      const currentRank = getPhaseRank(currentPhase);

      if (currentPhase === "peak" && lastRank < getPhaseRank("peak")) {
        await peakReachedEmail(sub.email, product.name, product.slug);
        await prisma.freshnessNotification.update({
          where: { id: sub.id },
          data: { lastNotifiedPhase: "peak" },
        });
        peakSent++;
      } else if (currentPhase === "maturity" && lastRank < getPhaseRank("maturity")) {
        await maturityReachedEmail(sub.email, product.name, product.slug);
        await prisma.freshnessNotification.update({
          where: { id: sub.id },
          data: { lastNotifiedPhase: "maturity" },
        });
        maturitySent++;
      } else if (day >= totalDays && sub.lastNotifiedPhase !== "end") {
        await freshnessEndedEmail(sub.email, product.name);
        await prisma.freshnessNotification.update({
          where: { id: sub.id },
          data: { lastNotifiedPhase: "end" },
        });
        endSent++;
      }
    }
  }

  return NextResponse.json({ peakSent, maturitySent, endSent });
}
