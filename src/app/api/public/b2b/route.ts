import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.b2BContent.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json({ items });
}
