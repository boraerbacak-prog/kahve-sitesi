import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subscriptions = await prisma.userSubscription.findMany({
    include: {
      plan: true,
      user: true,
      deliveries: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscriptions });
}

export async function PUT(req: Request) {
  const { id, status, deliveryFrequency, equipment, packageCount, grindSetting, flavorProfile, roastPreference, notes } = await req.json();

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (deliveryFrequency) data.deliveryFrequency = deliveryFrequency;
  if (equipment !== undefined) data.equipment = equipment;
  if (packageCount) data.packageCount = packageCount;
  if (grindSetting !== undefined) data.grindSetting = grindSetting;
  if (flavorProfile !== undefined) data.flavorProfile = flavorProfile;
  if (roastPreference !== undefined) data.roastPreference = roastPreference;
  if (notes !== undefined) data.notes = notes;

  const subscription = await prisma.userSubscription.update({
    where: { id },
    data,
    include: { plan: true, user: true, deliveries: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  return NextResponse.json({ subscription });
}
