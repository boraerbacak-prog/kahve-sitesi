import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPendingEarn, useCekirdekPara, hasKahveInCart, getCartKahveTotal } from "@/lib/loyalty";
import { estimateDeliveryDate } from "@/lib/delivery-estimator";

async function getClientIp(req: NextRequest | Request): Promise<string | null> {
  try {
    const headers = req instanceof NextRequest ? req.headers : new Headers(req.headers);
    return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || headers.get("x-real-ip")
      || null;
  } catch {
    return null;
  }
}

async function checkRateLimit(userId: string, ip: string | null): Promise<{ allowed: boolean; reason?: string }> {
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const recentOrders = await prisma.order.count({
    where: { userId, createdAt: { gte: oneMinuteAgo } },
  });
  if (recentOrders >= 3) {
    if (ip) {
      await prisma.blockedIp.upsert({
        where: { ip },
        update: { reason: "rate_limit", orderCount: { increment: 1 } },
        create: { ip, reason: "rate_limit", orderCount: recentOrders },
      });
    }
    return { allowed: false, reason: "Çok fazla sipariş denemesi. Hesabınız geçici olarak kısıtlandı." };
  }
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const rateCheck = await checkRateLimit(session.user.id, await getClientIp(req));
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: rateCheck.reason }, { status: 429 });
  }

  const body = await req.json();
  const { shippingName, shippingAddress, shippingCity, shippingPhone, paymentMethod, useCekirdekKurus } = body;

  if (!shippingName || !shippingAddress || !shippingCity || !shippingPhone) {
    return NextResponse.json({ error: "Tüm adres alanları gerekli" }, { status: 400 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Sepetiniz boş" }, { status: 400 });
  }

  // Çekirdek Kredi kullanımı kontrolü
  let cekirdekKurusKullan = 0;
  if (useCekirdekKurus && useCekirdekKurus > 0) {
    const kahveVar = await hasKahveInCart(session.user.id);
    if (!kahveVar) {
      return NextResponse.json({ error: "Çekirdek Kredi sadece kahve ürünlerinde kullanılabilir." }, { status: 400 });
    }

    const kahveTotal = await getCartKahveTotal(session.user.id);
    const maxSpendKurus = Math.round(kahveTotal * 100);

    if (useCekirdekKurus > maxSpendKurus) {
      return NextResponse.json({
        error: `Çekirdek Kredi kullanımı sepetteki kahve tutarını (${kahveTotal.toFixed(2)} TL) geçemez.`,
        maxSpendableTL: kahveTotal,
      }, { status: 400 });
    }
    cekirdekKurusKullan = useCekirdekKurus;
  }

  // Toplamı hesapla (Çekirdek Kredi varsa düş)
  const rawTotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const total = Math.max(0, rawTotal - (cekirdekKurusKullan / 100));

  // Cüzdan ödemesi kontrolü
  if (paymentMethod === "wallet") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } });
    const balance = user?.walletBalance || 0;
    if (balance < total) {
      return NextResponse.json({
        error: `Cüzdan bakiyeniz yetersiz. İhtiyaç: ${total.toFixed(2)} TL, Bakiyeniz: ${balance.toFixed(2)} TL`,
        walletBalance: balance,
        needed: total - balance,
      }, { status: 400 });
    }
  }

  const estimatedDeliveryDate = await estimateDeliveryDate();

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total,
      status: "pending",
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPhone,
      paymentMethod: paymentMethod || "wallet",
      estimatedDeliveryDate,
      ipAddress: await getClientIp(req),
      items: {
        create: cartItems.map((ci) => ({
          productId: ci.productId,
          quantity: ci.quantity,
          price: ci.product.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  // Çekirdek Kredi kullanımını işle (önce: wallet henüz çekilmedi, rollback gerekmez)
  if (cekirdekKurusKullan > 0) {
    const kahveTotal = await getCartKahveTotal(session.user.id);
    try {
      await useCekirdekPara(session.user.id, cekirdekKurusKullan, order.id, kahveTotal);
    } catch (e: any) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  }

  // Cüzdan ödemesini işle (sonra: çekirdek zaten çekildi, hata olursa rollback yap)
  if (paymentMethod === "wallet") {
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { walletBalance: { decrement: total } },
        }),
        prisma.walletTransaction.create({
          data: {
            userId: session.user.id,
            amount: -total,
            type: "payment",
            status: "completed",
            orderId: order.id,
            note: `Sipariş #${order.id.slice(0, 8)} için cüzdan ödemesi`,
            completedAt: new Date(),
          },
        }),
      ]);
    } catch (e: any) {
      // Wallet hatası: çekirdek krediyi geri yükle, siparişi iptal et
      if (cekirdekKurusKullan > 0) {
        const loyalty = await prisma.userLoyalty.findUnique({ where: { userId: session.user.id } });
        if (loyalty) {
          await prisma.$transaction([
            prisma.userLoyalty.update({
              where: { userId: session.user.id },
              data: { points: { increment: cekirdekKurusKullan } },
            }),
            prisma.loyaltyTransaction.create({
              data: {
                userId: session.user.id,
                loyaltyId: loyalty.id,
                amount: cekirdekKurusKullan,
                type: "refund",
                status: "available",
                orderId: order.id,
                note: `Çekirdek Kredi iadesi (cüzdan ödemesi başarısız, sipariş #${order.id.slice(0, 8)})`,
                availableAt: new Date(),
              },
            }),
          ]);
        }
      }
      await prisma.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
      return NextResponse.json({ error: "Cüzdan ödemesi başarısız oldu: " + (e?.message || "bilinmeyen hata") }, { status: 500 });
    }
  }

  // Pending Çekirdek Kredi kazanım kaydı oluştur
  const earnedPoints = await createPendingEarn(session.user.id, order.id);

  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json({
    success: true,
    order,
    estimatedDeliveryDate: order.estimatedDeliveryDate?.toISOString(),
    cekirdekPara: {
      usedKurus: cekirdekKurusKullan,
      usedTL: cekirdekKurusKullan / 100,
      earnedKurus: earnedPoints,
      earnedTL: earnedPoints / 100,
    },
  });
}
