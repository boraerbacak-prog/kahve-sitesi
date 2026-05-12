import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { subscriptionId, pause } = await req.json();

    const sub = await prisma.userSubscription.findFirst({
      where: { id: subscriptionId, userId: session.user.id },
    });
    if (!sub) {
      return NextResponse.json({ error: "Abonelik bulunamadı" }, { status: 404 });
    }

    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: pause ? "paused" : "active",
        pauseDate: pause ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
