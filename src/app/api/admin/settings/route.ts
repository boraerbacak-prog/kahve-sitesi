import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ settings: map });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const entries = body.settings as Record<string, string>;
  for (const [key, value] of Object.entries(entries)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, group: body.group || "general" },
      create: { key, value, group: body.group || "general" },
    });
  }
  return NextResponse.json({ success: true });
}
