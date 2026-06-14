import { prisma } from "./prisma";

export async function getGreenBeanThreshold(): Promise<number> {
  const settings = await prisma.loyaltySettings.findUnique({ where: { id: "global" } });
  return settings?.greenBeanThreshold ?? 20;
}

export async function estimateDeliveryDate(): Promise<Date> {
  const settings = await prisma.loyaltySettings.findUnique({ where: { id: "global" } });
  const capacity = settings?.dailyRoastCapacity ?? 50;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await prisma.order.count({
    where: {
      createdAt: { gte: today },
      status: { notIn: ["cancelled"] },
    },
  });

  const queueDay = Math.floor(todayOrders / Math.max(capacity, 1));

  const estimated = new Date();
  estimated.setDate(estimated.getDate() + 2 + queueDay);
  estimated.setHours(12, 0, 0, 0);

  return estimated;
}
