import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfMonth },
      status: { notIn: ["cancelled", "refunded"] },
    },
    include: { items: true },
  });

  const salesMap = new Map<string, { qty: number; revenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = salesMap.get(item.productId) || { qty: 0, revenue: 0 };
      existing.qty += item.quantity;
      existing.revenue += item.price * item.quantity;
      salesMap.set(item.productId, existing);
    }
  }

  const sales = Array.from(salesMap.entries()).map(([productId, data]) => ({
    productId,
    monthlyQty: data.qty,
    monthlyRevenue: data.revenue,
  }));

  return NextResponse.json({ sales });
}
