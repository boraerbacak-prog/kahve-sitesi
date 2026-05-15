import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  pointsPerLira: 1,
  pointsToLira: 0.05,
  minRedeemPoints: 100,
  maxDiscountPct: 50,
  bronzeMin: 0,
  bronzeMax: 500,
  silverMin: 500,
  silverMax: 2000,
  goldMin: 2000,
  goldMax: 999999,
  bronzeShippingThreshold: 990,
  silverShippingThreshold: 500,
  goldShippingThreshold: 0,
  bronzeDiscountPct: 0,
  silverDiscountPct: 3,
  goldDiscountPct: 5,
  welcomePoints: 500,
  welcomeDiscountPct: 10,
  birthdayPoints: 300,
  referralPoints: 100,
  referralFriendPct: 10,
  subscriptionDiscountPct: 5,
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
