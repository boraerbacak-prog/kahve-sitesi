import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const group = url.searchParams.get("group") || "header";

  const items = await prisma.menuItem.findMany({
    include: { children: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } },
    where: { group, parentId: null, isVisible: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ items });
}
