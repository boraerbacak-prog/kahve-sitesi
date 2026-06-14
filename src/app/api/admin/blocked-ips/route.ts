import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ips = await prisma.blockedIp.findMany({ orderBy: { blockedAt: "desc" } });
  return NextResponse.json({ blockedIps: ips });
}

export async function POST(req: Request) {
  const { ip, reason, note } = await req.json();
  const existing = await prisma.blockedIp.findUnique({ where: { ip } });
  if (existing) {
    return NextResponse.json({ error: "Bu IP zaten engellenmiş" }, { status: 400 });
  }
  const blocked = await prisma.blockedIp.create({
    data: { ip, reason: reason || "manual", note },
  });
  return NextResponse.json({ blockedIp: blocked });
}

export async function DELETE(req: Request) {
  const { ip } = await req.json();
  await prisma.blockedIp.delete({ where: { ip } });
  return NextResponse.json({ success: true });
}
