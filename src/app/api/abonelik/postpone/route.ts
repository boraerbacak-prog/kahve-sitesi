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
      return NextResponse.json({ error: "Yalnızca aktif abonelikler ertelenebilir" }, { status: 400 });
    }

    const newDate = new Date(
      (sub.nextDelivery || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000
    );

    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { nextDelivery: newDate },
    });

    adminSubscriptionNotification({
      type: "erteleme",
      userName: session.user.name || "İsimsiz",
      userEmail: session.user.email!,
      planName: sub.plan.name,
      details: `Sevkiyat ${newDate.toLocaleDateString("tr-TR")} tarihine ertelendi`,
    });

    return NextResponse.json({ success: true, nextDelivery: newDate });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
