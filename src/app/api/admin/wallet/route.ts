import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const all = req.nextUrl.searchParams.get("all") === "true";
  const exportCsv = req.nextUrl.searchParams.get("export") === "csv";

  if (all) {
    const transactions = await prisma.walletTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { user: { select: { name: true, email: true } } },
    });

    if (exportCsv) {
      const header = "id,tarih,kullanici,email,tip,miktar,durum,not,orderId\n";
      const rows = transactions.map(t =>
        [
          t.id,
          t.createdAt.toISOString(),
          t.user.name || "",
          t.user.email || "",
          t.type,
          t.amount,
          t.status,
          `"${(t.note || "").replace(/"/g, '""')}"`,
          t.orderId || "",
        ].join(",")
      ).join("\n");
      return new NextResponse("\uFEFF" + header + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cuzdan-islemler-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ transactions });
  }

  const requests = await prisma.walletTransaction.findMany({
    where: { type: "top_up", status: "pending" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ requests });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id, action } = await req.json();
  const tx = await prisma.walletTransaction.findUnique({ where: { id } });
  if (!tx || tx.type !== "top_up" || tx.status !== "pending") {
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  }

  if (action === "confirm") {
    await prisma.$transaction([
      prisma.user.update({ where: { id: tx.userId }, data: { walletBalance: { increment: tx.amount } } }),
      prisma.walletTransaction.update({ where: { id }, data: { status: "completed", completedAt: new Date() } }),
    ]);
    return NextResponse.json({ success: true });
  }

  if (action === "cancel") {
    await prisma.walletTransaction.update({ where: { id }, data: { status: "cancelled" } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
}
