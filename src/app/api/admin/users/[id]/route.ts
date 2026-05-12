import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } },
      subscriptions: { include: { plan: true, deliveries: true } },
      chatThreads: { include: { messages: { orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" }, take: 5 },
    },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, email, role } = await req.json();
  const user = await prisma.user.update({ where: { id }, data: { name, email, role } });
  return NextResponse.json({ user });
}
