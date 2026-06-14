import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const group = url.searchParams.get("group");

  const items = await prisma.menuItem.findMany({
    include: { children: { orderBy: { sortOrder: "asc" } } },
    where: group ? { group, parentId: null } : { parentId: null },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { label, href, parentId, sortOrder, isVisible, icon: menuIcon, group } = await req.json();
  const item = await prisma.menuItem.create({
    data: { label, href, parentId: parentId || null, sortOrder: sortOrder || 0, isVisible: isVisible ?? true, icon: menuIcon, group: group || "header" },
  });
  return NextResponse.json({ item });
}

export async function PUT(req: Request) {
  const { id, label, href, parentId, sortOrder, isVisible, icon: menuIcon, group } = await req.json();
  const item = await prisma.menuItem.update({
    where: { id },
    data: { label, href, parentId, sortOrder, isVisible, icon: menuIcon, group },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
