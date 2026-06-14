import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.filmReelItem.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const data = await req.json();
  const item = await prisma.filmReelItem.create({ data });
  return NextResponse.json({ item });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const item = await prisma.filmReelItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.filmReelItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
