import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserLoyaltyInfo } from "@/lib/loyalty";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { action, amount, points, reference } = await req.json();

  try {
    if (action === "award") {
      const { awardPoints } = await import("@/lib/loyalty");
      const awarded = await awardPoints(session.user.id, amount, "earn", reference);
      return NextResponse.json({ success: true, points: awarded });
    }

    if (action === "redeem") {
      return NextResponse.json({
        error: "Çekirdek Kredi kullanımı sadece ödeme sayfasında yapılabilir.",
      }, { status: 400 });
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

  const info = await getUserLoyaltyInfo(session.user.id);
  return NextResponse.json(info);
}
