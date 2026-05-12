import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { subscriptionId, equipment, grindSetting, flavorProfile, roastPreference, deliveryFrequency, notes } = await req.json();

    const sub = await prisma.userSubscription.findFirst({
      where: { id: subscriptionId, userId: session.user.id },
    });
    if (!sub) {
      return NextResponse.json({ error: "Abonelik bulunamadı" }, { status: 404 });
    }

    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        ...(equipment !== undefined && { equipment }),
        ...(grindSetting !== undefined && { grindSetting }),
        ...(flavorProfile !== undefined && { flavorProfile }),
        ...(roastPreference !== undefined && { roastPreference }),
        ...(deliveryFrequency !== undefined && { deliveryFrequency }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Profil güncellenemedi" }, { status: 500 });
  }
}
