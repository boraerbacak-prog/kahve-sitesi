import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const info = await prisma.kavurumhaneInfo.findFirst();
  const processes = await prisma.kavurumhaneProcess.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ info, processes });
}

export async function POST(req: Request) {
  const data = await req.json();
  if (data._type === "info") {
    const { _type, ...rest } = data;
    const info = await prisma.kavurumhaneInfo.upsert({
      where: { id: "global" },
      update: rest,
      create: { id: "global", ...rest },
    });
    return NextResponse.json({ info });
  }
  if (data._type === "process") {
    const { _type, ...rest } = data;
    const process = await prisma.kavurumhaneProcess.create({ data: rest });
    return NextResponse.json({ process });
  }
  return NextResponse.json({ error: "unknown _type" }, { status: 400 });
}

export async function PUT(req: Request) {
  const data = await req.json();
  if (data._type === "process") {
    const { _type, id, ...rest } = data;
    const process = await prisma.kavurumhaneProcess.update({ where: { id }, data: rest });
    return NextResponse.json({ process });
  }
  return NextResponse.json({ error: "unknown _type" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.kavurumhaneProcess.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
