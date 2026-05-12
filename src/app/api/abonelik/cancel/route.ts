import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, hasStripeKeys } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { subscriptionId } = await req.json();

    const sub = await prisma.userSubscription.findFirst({
      where: { id: subscriptionId, userId: session.user.id },
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

    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { status: "cancelled", cancelledDate: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "İptal başarısız" }, { status: 500 });
  }
}
