import { prisma } from "./prisma";

const TIER_DEFAULTS = {
  earnRatePct: 5.0,
  pendingDays: 14,
  monthlyCapKurus: 150000,
  freeShippingThresholdKurus: 100000,
  shippingCostKurus: 15000,

  referralRewardKurus: 10000,
  referralFriendDiscountPct: 10,
  subscriptionDiscountPct: 5,
};

export async function getSettings() {
  let settings = await prisma.loyaltySettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.loyaltySettings.create({ data: { id: "global", ...TIER_DEFAULTS } });
  }
  return settings;
}

export async function ensureUserLoyalty(userId: string) {
  let loyalty = await prisma.userLoyalty.findUnique({ where: { userId } });
  if (!loyalty) {
    loyalty = await prisma.userLoyalty.create({ data: { userId } });
  }
  return loyalty;
}

export async function isActiveSubscriber(userId: string): Promise<boolean> {
  const sub = await prisma.userSubscription.findFirst({
    where: { userId, status: "active" },
  });
  return !!sub;
}

export function calcCekirdekPara(price: number, earnRatePct?: number): number {
  const rate = earnRatePct ?? 5.0;
  return Math.round(price * 100 * (rate / 100));
}

export async function getCartKahveTotal(userId: string): Promise<number> {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
  });
  return cartItems
    .filter(ci => ci.product.category.type === "kahve" && !ci.product.loyaltyExcluded)
    .reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
}

export async function hasKahveInCart(userId: string): Promise<boolean> {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
  });
  return cartItems.some(ci => ci.product.category.type === "kahve" && !ci.product.loyaltyExcluded);
}

export async function getAvailablePoints(userId: string): Promise<number> {
  const loyalty = await ensureUserLoyalty(userId);
  return loyalty.points;
}

export async function getPendingPoints(userId: string): Promise<number> {
  const loyalty = await ensureUserLoyalty(userId);
  return loyalty.pendingPoints;
}

export async function calcOrderEarn(orderId: string): Promise<number> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  if (!order) return 0;

  const settings = await getSettings();
  const rawTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  if (rawTotal <= 0) return 0;

  const kahveItems = order.items.filter(
    i => i.product.category?.type === "kahve" && !i.product.loyaltyExcluded
  );
  if (kahveItems.length === 0) return 0;

  const kahveRawTotal = kahveItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalDeductions = Math.max(0, rawTotal - order.total);
  const kahveShare = kahveRawTotal / rawTotal;
  const kahveDeductions = totalDeductions * kahveShare;
  const netKahvePaid = Math.max(0, kahveRawTotal - kahveDeductions);

  const isSub = await isActiveSubscriber(order.userId);
  const effectiveRate = isSub ? settings.earnRatePct * 2 : settings.earnRatePct;

  return calcCekirdekPara(netKahvePaid, effectiveRate);
}

export async function calcCartEarnPreview(userId: string): Promise<number> {
  const settings = await getSettings();
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
  });
  const isSub = await isActiveSubscriber(userId);
  const effectiveRate = isSub ? settings.earnRatePct * 2 : settings.earnRatePct;
  let totalPoints = 0;
  for (const ci of cartItems) {
    if (ci.product.category.type === "kahve" && !ci.product.loyaltyExcluded) {
      totalPoints += calcCekirdekPara(ci.product.price * ci.quantity, effectiveRate);
    }
  }
  return totalPoints;
}

export async function createPendingEarn(userId: string, orderId: string) {
  const settings = await getSettings();
  const loyalty = await ensureUserLoyalty(userId);
  let points = await calcOrderEarn(orderId);
  if (points <= 0) return 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentTxns = await prisma.loyaltyTransaction.findMany({
    where: {
      userId,
      type: "earn",
      status: { in: ["pending", "available"] },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true },
  });
  const earnedThisMonth = recentTxns.reduce((s, t) => s + t.amount, 0);
  if (earnedThisMonth >= settings.monthlyCapKurus) return 0;
  points = Math.min(points, settings.monthlyCapKurus - earnedThisMonth);
  if (points <= 0) return 0;

  await prisma.loyaltyTransaction.create({
    data: {
      userId,
      loyaltyId: loyalty.id,
      amount: points,
      type: "earn",
      status: "pending",
      orderId,
      note: `${(points / 100).toFixed(2)} TL Çekirdek Kredi bekleniyor (sipariş #${orderId.slice(0, 8)})`,
    },
  });

  await prisma.userLoyalty.update({
    where: { userId },
    data: { pendingPoints: { increment: points } },
  });

  return points;
}

export async function releasePendingEarn(orderId: string) {
  const settings = await getSettings();
  const availableAt = new Date(Date.now() + settings.pendingDays * 24 * 60 * 60 * 1000);

  const txns = await prisma.loyaltyTransaction.findMany({
    where: { orderId, type: "earn", status: "pending" },
  });

  for (const txn of txns) {
    await prisma.loyaltyTransaction.update({
      where: { id: txn.id },
      data: { status: "available", availableAt },
    });

    await prisma.userLoyalty.update({
      where: { userId: txn.userId },
      data: {
        pendingPoints: { decrement: txn.amount },
        points: { increment: txn.amount },
      },
    });
  }

  return txns.length;
}

export async function refundOrderPoints(orderId: string, refundedTotal?: number) {
  const settings = await getSettings();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return 0;

  let shippingDeductionKurus = 0;
  if (refundedTotal && refundedTotal > 0) {
    const remainingLira = order.total - refundedTotal;
    const remainingKurus = Math.round(remainingLira * 100);
    const thresholdKurus = settings.freeShippingThresholdKurus;
    const orderTotalKurus = Math.round(order.total * 100);
    if (remainingLira > 0 && remainingKurus < thresholdKurus && orderTotalKurus >= thresholdKurus) {
      shippingDeductionKurus = settings.shippingCostKurus;
    }
  }

  const txns = await prisma.loyaltyTransaction.findMany({
    where: { orderId, type: "earn", status: { in: ["pending", "available"] } },
  });

  const totalEarned = txns.reduce((s, t) => s + t.amount, 0);
  const actualDeduction = Math.min(shippingDeductionKurus, totalEarned);

  for (const txn of txns) {
    const deductAmount = actualDeduction > 0 && totalEarned > 0
      ? txn.amount - Math.round((txn.amount / totalEarned) * actualDeduction)
      : txn.amount;

    await prisma.loyaltyTransaction.update({
      where: { id: txn.id },
      data: { status: "refunded", note: `${txn.note || ""} (İADE${actualDeduction > 0 ? " + kargo" : ""})` },
    });

    if (txn.status === "pending") {
      await prisma.userLoyalty.update({
        where: { userId: txn.userId },
        data: { pendingPoints: { decrement: txn.amount } },
      });
    } else if (txn.status === "available") {
      await prisma.userLoyalty.update({
        where: { userId: txn.userId },
        data: { points: { decrement: Math.min(deductAmount, txn.amount) } },
      });
    }
  }

  const redeemTxns = await prisma.loyaltyTransaction.findMany({
    where: { orderId, type: "redeem", status: "used" },
  });

  for (const txn of redeemTxns) {
    await prisma.loyaltyTransaction.update({
      where: { id: txn.id },
      data: { status: "refunded" },
    });

    await prisma.userLoyalty.update({
      where: { userId: txn.userId },
      data: { points: { increment: Math.abs(txn.amount) } },
    });
  }

  return txns.length + redeemTxns.length;
}

export async function useCekirdekPara(
  userId: string,
  amountKurus: number,
  orderId: string,
  kahveTotalLira: number,
) {
  const loyalty = await ensureUserLoyalty(userId);

  if (loyalty.points < amountKurus) {
    throw new Error(`Yetersiz Çekirdek Kredi bakiyesi. Kullanılabilir: ${(loyalty.points / 100).toFixed(2)} TL`);
  }

  const maxSpendKurus = Math.round(kahveTotalLira * 100);
  if (amountKurus > maxSpendKurus) {
    throw new Error(`Çekirdek Kredi kullanımı sepetteki kahve tutarını (${kahveTotalLira.toFixed(2)} TL) geçemez.`);
  }

  const spentLira = amountKurus / 100;

  await prisma.loyaltyTransaction.create({
    data: {
      userId,
      loyaltyId: loyalty.id,
      amount: -amountKurus,
      type: "redeem",
      status: "used",
      orderId,
      note: `${spentLira.toFixed(2)} TL Çekirdek Kredi kullanıldı (sipariş #${orderId.slice(0, 8)})`,
    },
  });

  await prisma.userLoyalty.update({
    where: { userId },
    data: { points: { decrement: amountKurus } },
  });

  return { spentKurus: amountKurus, spentLira };
}

export async function awardPoints(userId: string, amount: number, type: string, reference?: string) {
  const loyalty = await ensureUserLoyalty(userId);
  await prisma.loyaltyTransaction.create({
    data: {
      userId,
      loyaltyId: loyalty.id,
      amount,
      type,
      status: "available",
      availableAt: new Date(),
      note: reference || `${(amount / 100).toFixed(2)} TL manuel yükleme`,
    },
  });
  await prisma.userLoyalty.update({
    where: { userId },
    data: { points: { increment: amount } },
  });
  return amount;
}

export async function awardReferralReward(userId: string) {
  const referral = await prisma.referral.findFirst({
    where: { refereeId: userId, status: "pending" },
  });
  if (!referral) return false;

  const settings = await getSettings();
  await awardPoints(referral.referrerId, settings.referralRewardKurus, "referral", "Arkadaşın ilk alışverişini yaptı!");
  await prisma.referral.update({
    where: { id: referral.id },
    data: { status: "rewarded", rewardedAt: new Date() },
  });
  return true;
}

export async function getTransactionHistory(userId: string, limit = 50, offset = 0) {
  return prisma.loyaltyTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function getUserLoyaltyInfo(userId: string) {
  const settings = await getSettings();
  const loyalty = await ensureUserLoyalty(userId);

  const available = loyalty.points;
  const pending = loyalty.pendingPoints;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyTxns = await prisma.loyaltyTransaction.findMany({
    where: {
      userId,
      type: "earn",
      status: { in: ["pending", "available"] },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true },
  });
  const monthlyEarned = monthlyTxns.reduce((s, t) => s + t.amount, 0);

  return {
    totalSpent: loyalty.totalSpent,
    points: available,
    availablePoints: available,
    availableTL: available / 100,
    pendingPoints: pending,
    pendingTL: pending / 100,
    monthlyEarnedTL: monthlyEarned / 100,
    monthlyCapTL: settings.monthlyCapKurus / 100,
    monthlyProgressPct: Math.min(100, Math.round((monthlyEarned / settings.monthlyCapKurus) * 100)),
  };
}
