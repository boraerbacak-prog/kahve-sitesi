import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const subscriptions = await prisma.freshnessNotification.findMany({
    where: { email },
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ subscriptions });
}

export async function POST(req: Request) {
  const { email, productId } = await req.json();
  if (!email || !productId) {
    return NextResponse.json({ error: "email and productId required" }, { status: 400 });
  }

  const existing = await prisma.freshnessNotification.findUnique({
    where: { email_productId: { email, productId } },
  });
  if (existing) {
    return NextResponse.json({ success: true, message: "already subscribed" });
  }

  await prisma.freshnessNotification.create({
    data: { email, productId },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { email, productId } = await req.json();
  if (!email || !productId) {
    return NextResponse.json({ error: "email and productId required" }, { status: 400 });
  }

  await prisma.freshnessNotification.deleteMany({
    where: { email, productId },
  });
  return NextResponse.json({ success: true });
}
