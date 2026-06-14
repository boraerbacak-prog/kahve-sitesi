import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tags = await prisma.blogTag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ tags });
}

export async function POST(req: Request) {
  const data = await req.json();
  const tag = await prisma.blogTag.create({ data });
  return NextResponse.json({ tag });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.blogTag.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
