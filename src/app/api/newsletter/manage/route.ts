import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action, id } = await req.json();

    if (!id || !["toggle", "delete"].includes(action)) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    if (action === "toggle") {
      const sub = await prisma.subscriber.findUnique({ where: { id } });
      if (!sub) return NextResponse.json({ error: "Abone bulunamadı." }, { status: 404 });
      await prisma.subscriber.update({ where: { id }, data: { isActive: !sub.isActive } });
      return NextResponse.json({ message: "Durum güncellendi." });
    }

    if (action === "delete") {
      await prisma.subscriber.delete({ where: { id } });
      return NextResponse.json({ message: "Abone silindi." });
    }

    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
