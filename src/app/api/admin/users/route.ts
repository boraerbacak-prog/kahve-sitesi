import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true, subscriptions: true, chatThreads: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}
