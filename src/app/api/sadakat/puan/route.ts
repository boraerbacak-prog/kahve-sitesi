import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { awardPoints, redeemPoints, ensureUserLoyalty, getSettings } from "@/lib/loyalty";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { action, amount, points, reference, note } = await req.json();

  try {
    if (action === "award") {
      const awarded = await awardPoints(session.user.id, amount, "earn", reference, note);
      return NextResponse.json({ success: true, points: awarded });
    }

    if (action === "redeem") {
      const result = await redeemPoints(session.user.id, points, reference);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const loyalty = await ensureUserLoyalty(session.user.id);
  const settings = await getSettings();
  const { tier, discountPct, shippingThreshold } = await import("@/lib/loyalty").then(
    (m) => m.getTier(loyalty.totalSpent, settings),
  );

  return NextResponse.json({
    points: loyalty.points,
    tier: loyalty.tier,
    totalSpent: loyalty.totalSpent,
    tierDiscountPct: discountPct,
    shippingThreshold,
  });
}
