import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request, props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const { password } = await req.json();

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
  });

  if (!user) return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpires: null },
  });

  return NextResponse.json({ success: true });
}
