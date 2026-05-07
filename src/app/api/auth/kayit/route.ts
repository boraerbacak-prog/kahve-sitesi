import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
