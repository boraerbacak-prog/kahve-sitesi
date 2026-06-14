import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stores = await prisma.store.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ stores });
}

export async function POST(req: Request) {
  const body = await req.json();
  const store = await prisma.store.create({ data: body });
  return NextResponse.json({ store });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const store = await prisma.store.update({ where: { id }, data });
  return NextResponse.json({ store });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.store.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
