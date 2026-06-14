import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1);
  const yearAgo = new Date(now); yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const baseWhere = { status: { not: "cancelled" } };

  const [
    weeklyRevenue,
    monthlyRevenue,
    yearlyRevenue,
    allTimeRevenue,
    weeklyOrderCount,
    monthlyOrderCount,
    yearlyOrderCount,
    topProducts,
    stockReport,
    reviews,
    messages,
    blockedIps,
    weeklySalesData,
    monthlySalesData,
    totalUsers,
    totalOrders,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { ...baseWhere, createdAt: { gte: weekAgo } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...baseWhere, createdAt: { gte: monthAgo } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...baseWhere, createdAt: { gte: yearAgo } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: baseWhere, _sum: { total: true } }),
    prisma.order.count({ where: { ...baseWhere, createdAt: { gte: weekAgo } } }),
    prisma.order.count({ where: { ...baseWhere, createdAt: { gte: monthAgo } } }),
    prisma.order.count({ where: { ...baseWhere, createdAt: { gte: yearAgo } } }),
    // Top selling products
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 50,
    }),
    // Stock report
    prisma.product.findMany({
      select: { id: true, name: true, slug: true, stock: true, price: true, published: true },
      orderBy: { stock: "asc" },
    }),
    // All reviews with product & user
    prisma.review.findMany({
      include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    // All messages
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    // Blocked IPs
    prisma.blockedIp.findMany({ orderBy: { blockedAt: "desc" } }),
    // Weekly sales data for chart
    prisma.order.findMany({
      where: { ...baseWhere, createdAt: { gte: weekAgo } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Monthly sales data for chart
    prisma.order.findMany({
      where: { ...baseWhere, createdAt: { gte: yearAgo } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count(),
    prisma.order.count(),
  ]);

  // Enrich top products with names
  const productIds = topProducts.map(t => t.productId);
  const products = productIds.length > 0
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true, stock: true } })
    : [];
  const productMap = new Map(products.map(p => [p.id, p]));

  const enrichedTopProducts = topProducts.map(t => {
    const p = productMap.get(t.productId);
    return {
      productId: t.productId,
      name: p?.name || "Bilinmeyen",
      slug: p?.slug || "",
      stock: p?.stock ?? 0,
      totalSold: t._sum.quantity || 0,
      totalRevenue: t._sum.price || 0,
    };
  });

  // Group stock by status
  const stockSummary = {
    outOfStock: stockReport.filter(p => p.stock === 0).length,
    lowStock: stockReport.filter(p => p.stock > 0 && p.stock <= 5).length,
    adequate: stockReport.filter(p => p.stock > 5 && p.stock <= 20).length,
    plenty: stockReport.filter(p => p.stock > 20).length,
    totalProducts: stockReport.length,
    products: stockReport,
  };

  return NextResponse.json({
    revenue: {
      weekly: { total: weeklyRevenue._sum.total || 0, count: weeklyOrderCount },
      monthly: { total: monthlyRevenue._sum.total || 0, count: monthlyOrderCount },
      yearly: { total: yearlyRevenue._sum.total || 0, count: yearlyOrderCount },
      allTime: { total: allTimeRevenue._sum.total || 0, count: totalOrders },
    },
    topProducts: enrichedTopProducts,
    stock: stockSummary,
    reviews,
    messages,
    blockedIps,
    charts: {
      weekly: weeklySalesData,
      monthly: monthlySalesData,
    },
    summary: {
      totalUsers,
      totalOrders,
    },
  });
}
