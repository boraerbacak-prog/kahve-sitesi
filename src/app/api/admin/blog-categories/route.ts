import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const data = await req.json();
  const cat = await prisma.blogCategory.create({ data });
  return NextResponse.json({ category: cat });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const cat = await prisma.blogCategory.update({ where: { id }, data });
  return NextResponse.json({ category: cat });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.blogCategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
