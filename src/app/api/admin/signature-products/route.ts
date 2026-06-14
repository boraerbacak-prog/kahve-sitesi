import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function safeFindMany() {
  try { return await prisma.signatureProduct.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  catch { return []; }
}
async function safeCreate(data: any) {
  try { return await prisma.signatureProduct.create({ data }); }
  catch { throw new Error("DB hatası"); }
}
async function safeUpdate(id: string, data: any) {
  try { return await prisma.signatureProduct.update({ where: { id }, data }); }
  catch { throw new Error("DB hatası"); }
}
async function safeDelete(id: string) {
  try { await prisma.signatureProduct.delete({ where: { id } }); }
  catch { throw new Error("DB hatası"); }
}

export async function GET() {
  const products = await safeFindMany();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const data = await req.json();
  const product = await safeCreate(data);
  return NextResponse.json({ product });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const product = await safeUpdate(id, data);
  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await safeDelete(id);
  return NextResponse.json({ success: true });
}
