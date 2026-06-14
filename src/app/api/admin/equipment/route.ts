import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function safeFindMany() {
  try { return await prisma.equipment.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  catch { return []; }
}
async function safeCreate(data: any) {
  try { return await prisma.equipment.create({ data }); }
  catch { throw new Error("DB hatası"); }
}
async function safeUpdate(id: string, data: any) {
  try { return await prisma.equipment.update({ where: { id }, data }); }
  catch { throw new Error("DB hatası"); }
}
async function safeDelete(id: string) {
  try { await prisma.equipment.delete({ where: { id } }); }
  catch { throw new Error("DB hatası"); }
}

export async function GET() {
  const equipment = await safeFindMany();
  return NextResponse.json({ equipment });
}

export async function POST(req: Request) {
  const data = await req.json();
  const item = await safeCreate(data);
  return NextResponse.json({ item });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const item = await safeUpdate(id, data);
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await safeDelete(id);
  return NextResponse.json({ success: true });
}
