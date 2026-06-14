import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const info = await prisma.kavurumhaneInfo.findFirst();
  const processes = await prisma.kavurumhaneProcess.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ info, processes });
}
