import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, phone, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Ad, e-posta, konu ve mesaj gerekli" }, { status: 400 });
  }

  await prisma.contactMessage.create({
    data: { name, email, phone: phone || null, subject, message },
  });

  return NextResponse.json({ success: true });
}
