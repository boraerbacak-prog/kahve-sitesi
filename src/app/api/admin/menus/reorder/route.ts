import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const { items } = await req.json();
  for (let i = 0; i < items.length; i++) {
    await prisma.menuItem.update({
      where: { id: items[i].id },
      data: { sortOrder: i, parentId: items[i].parentId || null },
    });
  }
  return NextResponse.json({ success: true });
}
