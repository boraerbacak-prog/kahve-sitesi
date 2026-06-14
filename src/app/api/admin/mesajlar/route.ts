import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ messages });
}

export async function PUT(req: Request) {
  const { id, isRead } = await req.json();
  await prisma.contactMessage.update({ where: { id }, data: { isRead } });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
