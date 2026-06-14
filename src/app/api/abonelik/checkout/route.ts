import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, hasStripeKeys } from "@/lib/stripe";
import { subscriptionConfirmEmail, adminSubscriptionNotification } from "@/lib/email";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { planId, equipment, grindSetting, flavorProfile, roastPreference, deliveryFrequency } = await req.json();

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 });
    }

    let stripeSubscriptionId: string | undefined;
    let stripeCustomerId: string | undefined;

    if (hasStripeKeys() && plan.stripePriceId) {
      const stripe = getStripe();
      const customers = await stripe.customers.list({ email: session.user.email!, limit: 1 });
      let customer = customers.data[0];
      if (!customer) {
        customer = await stripe.customers.create({
          email: session.user.email!,
          name: session.user.name || undefined,
          metadata: { userId: session.user.id },
        });
      }
      stripeCustomerId = customer.id;

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        metadata: { userId: session.user.id, planId },
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      stripeSubscriptionId = subscription.id;
    }

    const userSub = await prisma.userSubscription.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        equipment: equipment || null,
        grindSetting: grindSetting || null,
        flavorProfile: flavorProfile || null,
        roastPreference: roastPreference || null,
        deliveryFrequency: deliveryFrequency || "monthly",
        packageCount: plan.packageCount,
        stripeSubscriptionId: stripeSubscriptionId || null,
        stripeCustomerId: stripeCustomerId || null,
        nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    });

    const delivery = await prisma.subscriptionDelivery.create({
      data: {
        subscriptionId: userSub.id,
        status: "pending",
        packageCount: plan.packageCount,
        roastDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
    });

    subscriptionConfirmEmail(session.user.email!, plan.name);
    adminSubscriptionNotification({
      type: "yeni",
      userName: session.user.name || "İsimsiz",
      userEmail: session.user.email!,
      planName: plan.name,
    });

    return NextResponse.json({ subscription: userSub, delivery });
  } catch (error) {
    console.error("Abonelik oluşturma hatası:", error);
    return NextResponse.json({ error: "Abonelik oluşturulamadı" }, { status: 500 });
  }
}
