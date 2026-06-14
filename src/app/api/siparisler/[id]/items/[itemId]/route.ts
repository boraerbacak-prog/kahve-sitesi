import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, itemId } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { userId: true, status: true } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.action === "open") data.openedAt = new Date();
  if (body.action === "consume") data.consumedAt = new Date();
  if (body.action === "review") {
    if (body.rating !== undefined) data.rating = body.rating;
    if (body.review !== undefined) data.review = body.review;
  }

  await prisma.orderItem.update({ where: { id: itemId }, data });
  return NextResponse.json({ success: true });
}
