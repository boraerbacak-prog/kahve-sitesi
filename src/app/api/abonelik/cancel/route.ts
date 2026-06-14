import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, hasStripeKeys } from "@/lib/stripe";
import { adminSubscriptionNotification } from "@/lib/email";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { subscriptionId, reason } = await req.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "İptal nedeninizi yazmalısınız." }, { status: 400 });
    }

    const sub = await prisma.userSubscription.findFirst({
      where: { id: subscriptionId, userId: session.user.id },
      include: { plan: true },
    });
    if (!sub) {
      return NextResponse.json({ error: "Abonelik bulunamadı" }, { status: 404 });
    }

    if (sub.stripeSubscriptionId && hasStripeKeys()) {
      const stripe = getStripe();
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    const existingNotes = sub.notes || "";
    const newNote = `İptal nedeni: ${reason.trim()}`;
    const updatedNotes = existingNotes
      ? `${existingNotes}\n${newNote}`
      : newNote;

    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "cancelled",
        cancelledDate: new Date(),
        notes: updatedNotes,
      },
    });

    adminSubscriptionNotification({
      type: "iptal",
      userName: session.user.name || "İsimsiz",
      userEmail: session.user.email!,
      planName: sub.plan.name,
      details: `İptal nedeni: ${reason.trim()}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "İptal işlemi başarısız" }, { status: 500 });
  }
}
