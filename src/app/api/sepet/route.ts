import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + (quantity || 1) },
    });
  } else {
    await prisma.cartItem.create({
      data: { userId: session.user.id, productId, quantity: quantity || 1 },
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  return NextResponse.json({ items });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { itemId } = await req.json();
  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
