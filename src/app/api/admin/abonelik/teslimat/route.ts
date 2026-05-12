import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, deliveryShippedEmail } from "@/lib/email";

export async function GET() {
  const deliveries = await prisma.subscriptionDelivery.findMany({
    include: {
      subscription: { include: { user: true, plan: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ deliveries });
}

export async function PUT(req: Request) {
  const { id, status, trackingNumber, trackingUrl, notes } = await req.json();

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
  if (notes !== undefined) updateData.notes = notes;

  if (status === "shipped") updateData.shipDate = new Date();
  if (status === "delivered") updateData.deliveredDate = new Date();

  const delivery = await prisma.subscriptionDelivery.update({
    where: { id },
    data: updateData,
    include: { subscription: { include: { user: true, plan: true } } },
  });

  if (status === "shipped") {
    const sub = delivery.subscription;
    sendEmail({
      to: sub.user.email,
      subject: `${sub.plan.name} Paketin Yolda! 🚚`,
      html: deliveryShippedEmail(sub.user.name || "Kahvesever", sub.plan.name, trackingUrl || undefined),
    });
  }

  return NextResponse.json({ delivery });
}

export async function POST(req: Request) {
  const { subscriptionId, packageCount, roastDate } = await req.json();

  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true, user: true },
  });
  if (!subscription) {
    return NextResponse.json({ error: "Abonelik bulunamadı" }, { status: 404 });
  }

  const delivery = await prisma.subscriptionDelivery.create({
    data: {
      subscriptionId,
      status: "pending",
      packageCount: packageCount || subscription.plan.packageCount,
      roastDate: roastDate ? new Date(roastDate) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ delivery });
}
