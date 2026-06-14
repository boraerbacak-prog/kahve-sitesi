import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const format = searchParams.get("format") || "json";
  const userId = searchParams.get("userId") || "";

  const where: Record<string, unknown> = {};

  if (userId) where.userId = userId;
  if (type) where.type = type;

  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }
    where.createdAt = dateFilter;
  }

  if (q) {
    where.loyalty = {
      user: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      },
    };
  }

  const [total, transactions, summary] = await Promise.all([
    prisma.loyaltyTransaction.count({ where }),
    prisma.loyaltyTransaction.findMany({
      where,
      include: {
        loyalty: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.loyaltyTransaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
      _count: { amount: true },
      where,
    }),
  ]);

  const agg = await prisma.userLoyalty.aggregate({
    _sum: { points: true, totalSpent: true },
  });

  if (format === "csv") {
    const header = "Tarih,Kullanıcı,E-Posta,İşlem Türü,Puan,Referans,Not";
    const rows = transactions.map((tx) =>
      [
        new Date(tx.createdAt).toLocaleString("tr-TR"),
        tx.loyalty.user.name || "",
        tx.loyalty.user.email,
        tx.type,
        tx.amount,
        tx.reference || "",
        (tx.note || "").replace(/,/g, ";"),
      ].join(","),
    );
    const csv = "\uFEFF" + [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rostello-cekirdek-kredi-raporu-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    transactions,
    summary,
    totals: {
      totalPoints: agg._sum.points || 0,
      totalSpent: agg._sum.totalSpent || 0,
    },
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
