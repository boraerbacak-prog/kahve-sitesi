import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ROST-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const { name, email, password, ref } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 400 });
    }

    // Referans kodu kontrolü
    let referrerId: string | null = null;
    if (ref) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: ref } });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Yeni kullanıcı için benzersiz referans kodu oluştur
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (await prisma.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode();
      attempts++;
      if (attempts > 10) {
        referralCode = `ROST-${Date.now().toString(36).toUpperCase()}`;
        break;
      }
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        referralCode,
      },
    });

    // Referans varsa kaydı oluştur
    if (referrerId) {
      await prisma.referral.create({
        data: {
          referrerId,
          refereeId: user.id,
          status: "pending",
        },
      });
    }

    return NextResponse.json({ success: true, referralCode });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
