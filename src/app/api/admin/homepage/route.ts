import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const blocks = await prisma.homepageBlock.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ blocks });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;
  const block = await prisma.homepageBlock.update({
    where: { id },
    data,
  });
  return NextResponse.json({ block });
}

export async function POST(req: Request) {
  const body = await req.json();
  const block = await prisma.homepageBlock.create({ data: body });
  return NextResponse.json({ block });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.homepageBlock.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
