import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function PUT(req: Request) {
  const { id, approved } = await req.json();
  await prisma.review.update({ where: { id }, data: { approved } });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
