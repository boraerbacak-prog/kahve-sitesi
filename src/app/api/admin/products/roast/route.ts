import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { stockNotificationEmail } from "@/lib/email";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { productId, stockIncrease, notify } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const now = new Date();
  const increase = stockIncrease ?? 50;

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      roastedAt: now,
      stock: product.stock + increase,
    },
  });

  await prisma.stockLog.create({
    data: {
      productId,
      oldStock: product.stock,
      newStock: product.stock + increase,
      change: increase,
      note: `Kavrum yapıldı — ${increase} adet eklendi`,
    },
  });

  if (notify) {
    const notifications = await prisma.stockNotification.findMany({
      where: { productId, notified: false },
    });

    for (const n of notifications) {
      try {
        await prisma.stockNotification.update({
          where: { id: n.id },
          data: { notified: true },
        });
        await stockNotificationEmail(n.email, product.name, product.slug);
      } catch {
        console.error(`Failed to send stock notification email to ${n.email}`);
      }
    }
  }

  return NextResponse.json({ success: true, product: updated, notified: notify });
}
