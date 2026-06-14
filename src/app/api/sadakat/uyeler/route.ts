import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 200; // get all for full list
  const skip = (page - 1) * limit;

  const where = q
    ? { user: { OR: [{ name: { contains: q } }, { email: { contains: q } }] } }
    : {};

  const [total, members] = await Promise.all([
    prisma.userLoyalty.count({ where }),
    prisma.userLoyalty.findMany({
      where,
include: { user: { select: { name: true, email: true, referralCode: true } } },
      skip,
      take: limit,
      orderBy: { totalSpent: "desc" },
    }),
  ]);

  return NextResponse.json({ members, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { id, points, totalSpent, birthDate } = await req.json();

  const data: Record<string, unknown> = {};
  if (points !== undefined) data.points = points;
  if (totalSpent !== undefined) data.totalSpent = totalSpent;
  if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;

  const member = await prisma.userLoyalty.update({
    where: { id },
    data,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ member });
}
