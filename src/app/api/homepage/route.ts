import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const blocks = await prisma.homepageBlock.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ blocks });
}
