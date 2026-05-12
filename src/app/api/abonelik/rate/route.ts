import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { deliveryId, rating } = await req.json();

    const delivery = await prisma.subscriptionDelivery.findFirst({
      where: { id: deliveryId },
      include: { subscription: true },
    });
    if (!delivery || delivery.subscription.userId !== session.user.id) {
      return NextResponse.json({ error: "Teslimat bulunamadı" }, { status: 404 });
    }

    await prisma.subscriptionDelivery.update({
      where: { id: deliveryId },
      data: { rating },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Değerlendirme başarısız" }, { status: 500 });
  }
}
