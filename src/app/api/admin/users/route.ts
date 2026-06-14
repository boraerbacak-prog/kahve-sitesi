import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true, subscriptions: true, chatThreads: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve şifre zorunludur" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || "customer" },
  });
  return NextResponse.json({ user });
}
