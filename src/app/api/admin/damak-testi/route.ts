import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 50;
  const skip = (page - 1) * limit;

  const [total, results] = await Promise.all([
    prisma.tasteTestResult.count(),
    prisma.tasteTestResult.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  const howStats = await prisma.tasteTestResult.groupBy({
    by: ["how"],
    _count: true,
  });

  const equipmentStats = await prisma.tasteTestResult.groupBy({
    by: ["equipment"],
    _count: true,
  });

  const flavorStats = await prisma.tasteTestResult.groupBy({
    by: ["flavor"],
    _count: true,
  });

  const roastStats = await prisma.tasteTestResult.groupBy({
    by: ["roast"],
    _count: true,
  });

  return NextResponse.json({
    results,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: { how: howStats, equipment: equipmentStats, flavor: flavorStats, roast: roastStats },
  });
}
