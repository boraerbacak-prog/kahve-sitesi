import { prisma } from "./prisma";

const TIER_DEFAULTS = {
  pointsPerLira: 1,
  pointsToLira: 0.05,
  minRedeemPoints: 100,
  maxDiscountPct: 50,
  bronzeMin: 0,
  bronzeMax: 500,
  silverMin: 500,
  silverMax: 2000,
  goldMin: 2000,
  goldMax: 999999,
  bronzeDiscountPct: 0,
  silverDiscountPct: 3,
  goldDiscountPct: 5,
  bronzeShippingThreshold: 990,
  silverShippingThreshold: 500,
  goldShippingThreshold: 0,
  welcomePoints: 500,
  birthdayPoints: 300,
  referralPoints: 100,
  referralFriendPct: 10,
  subscriptionDiscountPct: 5,
  welcomeDiscountPct: 10,
};

export async function getSettings() {
  let settings = await prisma.loyaltySettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.loyaltySettings.create({
      data: { id: "global", ...TIER_DEFAULTS },
    });
  }
  return settings;
}

const tierDefs = [
  { key: "bronze" as const, minField: "bronzeMin", maxField: "bronzeMax", discountField: "bronzeDiscountPct" as const, shipField: "bronzeShippingThreshold" as const },
  { key: "silver" as const, minField: "silverMin", maxField: "silverMax", discountField: "silverDiscountPct" as const, shipField: "silverShippingThreshold" as const },
  { key: "gold" as const, minField: "goldMin", maxField: "goldMax", discountField: "goldDiscountPct" as const, shipField: "goldShippingThreshold" as const },
] as const;

export function getTier(totalSpent: number, settings: Awaited<ReturnType<typeof getSettings>>) {
  for (let i = tierDefs.length - 1; i >= 0; i--) {
    const t = tierDefs[i];
    const min = settings[t.minField];
    const max = settings[t.maxField];
    if (totalSpent >= min && totalSpent < max) {
      return { tier: t.key, discountPct: settings[t.discountField], shippingThreshold: settings[t.shipField] };
    }
  }
  return { tier: "bronze" as const, discountPct: settings.bronzeDiscountPct, shippingThreshold: settings.bronzeShippingThreshold };
}

export function calcPoints(amount: number, settings: Awaited<ReturnType<typeof getSettings>>) {
  return Math.round(amount * settings.pointsPerLira);
}

export function pointsToLira(points: number, settings: Awaited<ReturnType<typeof getSettings>>) {
  return points * settings.pointsToLira;
}

export async function ensureUserLoyalty(userId: string) {
  let loyalty = await prisma.userLoyalty.findUnique({ where: { userId } });
  if (!loyalty) {
    loyalty = await prisma.userLoyalty.create({ data: { userId } });
  }
  return loyalty;
}

export async function awardPoints(
  userId: string,
  amount: number,
  type: "earn" | "welcome" | "birthday" | "referral" | "admin",
  reference?: string,
  note?: string,
) {
  const settings = await getSettings();
  const loyalty = await ensureUserLoyalty(userId);
  const points = type === "earn" ? calcPoints(amount, settings) : amount;

  await prisma.loyaltyTransaction.create({
    data: {
      userId,
      loyaltyId: loyalty.id,
      amount: points,
      type,
      reference,
      note,
    },
  });

  await prisma.userLoyalty.update({
    where: { userId },
    data: {
      points: { increment: points },
      totalSpent: type === "earn" ? { increment: amount } : undefined,
    },
  });

  await syncTier(userId);
  return points;
}

export async function redeemPoints(
  userId: string,
  points: number,
  reference?: string,
) {
  const settings = await getSettings();
  const loyalty = await ensureUserLoyalty(userId);

  if (loyalty.points < points) throw new Error("Yetersiz puan");
  if (points < settings.minRedeemPoints) throw new Error(`Minimum ${settings.minRedeemPoints} puan kullanmalısınız`);

  const discountLira = pointsToLira(points, settings);

  await prisma.loyaltyTransaction.create({
    data: {
      userId,
      loyaltyId: loyalty.id,
      amount: -points,
      type: "redeem",
      reference,
      note: `${discountLira.toFixed(2)} ₺ indirim`,
    },
  });

  await prisma.userLoyalty.update({
    where: { userId },
    data: { points: { decrement: points } },
  });

  return { points, discountLira };
}

export async function syncTier(userId: string) {
  const settings = await getSettings();
  const loyalty = await ensureUserLoyalty(userId);
  const { tier } = getTier(loyalty.totalSpent, settings);

  if (loyalty.tier !== tier) {
    await prisma.userLoyalty.update({
      where: { userId },
      data: { tier },
    });
  }

  return tier;
}
