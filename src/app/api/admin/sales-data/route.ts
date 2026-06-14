import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "cancelled" } },
    select: { total: true, createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;

  const monthly: Record<string, { revenue: number; count: number }> = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 7);
    if (!monthly[key]) monthly[key] = { revenue: 0, count: 0 };
    monthly[key].revenue += o.total;
    monthly[key].count++;
  }

  const monthlyData = Object.entries(monthly).map(([month, data]) => ({ month, ...data }));

  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, price: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });
  const productIds = topProducts.map(p => p.productId);
  const products = productIds.length > 0
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } })
    : [];
  const productMap = Object.fromEntries(products.map(p => [p.id, p.name]));

  const topProductsData = topProducts.map(p => ({
    name: productMap[p.productId] || "Bilinmeyen",
    totalQty: p._sum.quantity || 0,
    totalRevenue: p._sum.price || 0,
  }));

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  return NextResponse.json({ totalRevenue, totalOrders, monthlyData, topProducts: topProductsData, statusCounts });
}
