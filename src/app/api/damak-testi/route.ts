import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, name, email, how, equipment, flavor, roast, results } = await req.json();

  if (!how || !equipment || !flavor || !roast) {
    return NextResponse.json({ error: "Tüm sorular cevaplanmalı" }, { status: 400 });
  }

  const test = await prisma.tasteTestResult.create({
    data: {
      userId: userId || null,
      name: name || null,
      email: email || null,
      how,
      equipment,
      flavor,
      roast,
      results: JSON.stringify(results || []),
      userAgent: req.headers.get("user-agent") || null,
    },
  });

  return NextResponse.json({ success: true, id: test.id });
}
