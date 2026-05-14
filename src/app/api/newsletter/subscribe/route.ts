import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name, source } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } });

    if (existing) {
      if (!existing.isActive) {
        await prisma.subscriber.update({ where: { email }, data: { isActive: true, source: source || "footer" } });
      }
      return NextResponse.json({ message: "Zaten abonesiniz!" });
    }

    await prisma.subscriber.create({
      data: { email, name: name || null, source: source || "footer" },
    });

    return NextResponse.json({ message: "Abone olduğunuz için teşekkürler!" });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
