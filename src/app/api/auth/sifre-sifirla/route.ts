import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true }); // gizlilik: kullanıcı var/yok söyleme

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpires: expires },
  });

  console.log(`[RESET] ${email} → ${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/sifre-sifirla/${token}`);

  return NextResponse.json({ success: true });
}
