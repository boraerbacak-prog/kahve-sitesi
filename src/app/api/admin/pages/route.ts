import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pages = await prisma.customPage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const { title, slug, content, template, published } = await req.json();
  const page = await prisma.customPage.create({
    data: { title, slug, content, template: template || "default", published: published ?? false },
  });
  return NextResponse.json({ page });
}

export async function PUT(req: Request) {
  const { id, title, slug, content, template, published } = await req.json();
  const page = await prisma.customPage.update({
    where: { id },
    data: { title, slug, content, template, published },
  });
  return NextResponse.json({ page });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.customPage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
