import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ subscriptions: [] });
  }

  try {
    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: session.user.id },
      include: {
        plan: true,
        deliveries: {
          orderBy: { createdAt: "desc" },
          include: { items: { include: { product: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json({ error: "Abonelikler yüklenemedi" }, { status: 500 });
  }
}
