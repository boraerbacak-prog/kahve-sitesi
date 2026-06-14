import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const unread = await prisma.adminNotification.count({ where: { isRead: false } });
  const recent = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ unread, notifications: recent });
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  await prisma.adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
