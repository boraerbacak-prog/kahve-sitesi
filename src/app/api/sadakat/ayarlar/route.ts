import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  earnRatePct: 5.0,
  pendingDays: 14,
  monthlyCapKurus: 150000,
  freeShippingThresholdKurus: 100000,
  shippingCostKurus: 15000,

  referralRewardKurus: 10000,
  referralFriendDiscountPct: 10,
  subscriptionDiscountPct: 5,
  dailyRoastCapacity: 50,
  greenBeanThreshold: 20,
};

async function getSettings() {
  let settings = await prisma.loyaltySettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.loyaltySettings.create({ data: { id: "global", ...DEFAULT_SETTINGS } });
  }
  return settings;
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  const body = await req.json();
  const allowed = Object.keys(DEFAULT_SETTINGS);
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }
  const settings = await prisma.loyaltySettings.upsert({
    where: { id: "global" },
    update: data,
    create: { id: "global", ...DEFAULT_SETTINGS, ...data },
  });
  return NextResponse.json(settings);
}
