import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderConfirmEmail, orderShippedEmail, orderDeliveredEmail, adminOrderNotification } from "@/lib/email";
import { releasePendingEarn, refundOrderPoints, awardReferralReward } from "@/lib/loyalty";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function PUT(req: Request) {
  const { id, status, cargoCompany, trackingNumber, refundedTotal } = await req.json();

  const updateData: Record<string, any> = {};
  if (status) updateData.status = status;
  if (cargoCompany !== undefined) updateData.cargoCompany = cargoCompany;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { user: true, items: { include: { product: true } } },
  });

  // Loyalty: sipariş teslim edildi → pending points → available
  if (status === "delivered") {
    releasePendingEarn(order.id).catch(() => {});
    awardReferralReward(order.userId).catch(() => {});
  }

  // Loyalty: sipariş iptal edildi → pending points iade/refund
  if (status === "cancelled") {
    refundOrderPoints(order.id, refundedTotal).catch(() => {});
    adminOrderNotification({
      type: "siparis_iptal",
      userName: order.user.name || "Bilinmiyor",
      userEmail: order.user.email || "bilinmiyor",
      orderTotal: order.total,
      orderId: order.id,
    }).catch(() => {});
  }

  // Email bildirimleri
  if (status === "confirmed" && order.user.email) {
    orderConfirmEmail(order.user.email, order.id).catch(() => {});
  } else if (status === "shipped" && order.user.email) {
    orderShippedEmail(order.user.email, order.id, trackingNumber || order.trackingNumber).catch(() => {});
  } else if (status === "delivered" && order.user.email) {
    orderDeliveredEmail(order.user.email, order.id).catch(() => {});
  }

  return NextResponse.json({ order });
}
