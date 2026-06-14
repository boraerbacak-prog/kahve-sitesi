import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { subject, body, target } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "Konu ve içerik zorunlu" }, { status: 400 });

  let emails: string[] = [];

  switch (target) {
    case "all_users":
      const users = await prisma.user.findMany({ select: { email: true } });
      emails = users.map(u => u.email);
      break;
    case "loyalty_members":
      const loyaltyUsers = await prisma.userLoyalty.findMany({
        select: { user: { select: { email: true } } },
      });
      emails = loyaltyUsers.map(l => l.user.email);
      break;
    case "active_subscribers":
      const activeSubs = await prisma.subscriber.findMany({ where: { isActive: true } });
      emails = activeSubs.map(s => s.email);
      break;
    default: // "subscribers"
      const allSubs = await prisma.subscriber.findMany();
      emails = allSubs.map(s => s.email);
      break;
  }

  emails = [...new Set(emails.filter(Boolean))];

  if (emails.length === 0) {
    return NextResponse.json({ error: "Hedef kitle boş" }, { status: 400 });
  }

  await prisma.emailLog.create({
    data: { subject, body, recipientCount: emails.length },
  });

  return NextResponse.json({ success: true, recipientCount: emails.length, target: target || "subscribers" });
}
