import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminSubscriptionNotification } from "@/lib/email";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { subscriptionId } = await req.json();

    const sub = await prisma.userSubscription.findFirst({
      where: { id: subscriptionId, userId: session.user.id },
      include: { plan: true },
    });
    if (!sub) {
      return NextResponse.json({ error: "Abonelik bulunamadı" }, { status: 404 });
    }
    if (sub.status !== "active") {
      return NextResponse.json({ error: "Yalnızca aktif abonelikler hızlandırılabilir" }, { status: 400 });
    }

    const delivery = await prisma.subscriptionDelivery.findFirst({
      where: { subscriptionId, status: "pending" },
      orderBy: { createdAt: "asc" },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Bekleyen teslimat bulunamadı" }, { status: 404 });
    }

    const newRoastDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

    await prisma.subscriptionDelivery.update({
      where: { id: delivery.id },
      data: { roastDate: newRoastDate },
    });

    adminSubscriptionNotification({
      type: "hizlandirma",
      userName: session.user.name || "İsimsiz",
      userEmail: session.user.email!,
      planName: sub.plan.name,
      details: "Bekleyen teslimat öne çekildi, kavrum yarına alındı",
    });

    return NextResponse.json({ success: true, roastDate: newRoastDate });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
