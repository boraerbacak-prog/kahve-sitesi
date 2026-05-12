import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    const body = await req.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session: any = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (userId && planId && session.subscription) {
          await prisma.userSubscription.updateMany({
            where: { userId, planId, stripeSubscriptionId: null },
            data: { stripeSubscriptionId: session.subscription as string },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub: any = event.data.object;
        await prisma.userSubscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "cancelled", cancelledDate: new Date() },
        });
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice: any = event.data.object;
        if (invoice.subscription) {
          await prisma.userSubscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
