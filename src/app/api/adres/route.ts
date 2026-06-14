import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ addresses: [] });
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  const data = await req.json();
  if (!data.fullName || !data.address || !data.city || !data.phone) {
    return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
  }

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      name: data.name || "default",
      fullName: data.fullName,
      address: data.address,
      city: data.city,
      phone: data.phone,
      isDefault: data.isDefault || false,
    },
  });

  return NextResponse.json({ success: true, address });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: "Adres ID gerekli" }, { status: 400 });

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.updateMany({
    where: { id: data.id, userId: session.user.id },
    data: {
      name: data.name,
      fullName: data.fullName,
      address: data.address,
      city: data.city,
      phone: data.phone,
      isDefault: data.isDefault,
    },
  });

  return NextResponse.json({ success: true, address });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  const { id } = await req.json();
  await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
