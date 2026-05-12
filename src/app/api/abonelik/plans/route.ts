import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: "Planlar yüklenemedi" }, { status: 500 });
  }
}
