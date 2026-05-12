import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const messages = await prisma.chatMessage.findMany({
    where: { role: "user", createdAt: { gte: sixMonthsAgo } },
    select: { content: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const totalMessages = messages.length;

  const wordCounts: Record<string, number> = {};
  for (const m of messages) {
    const words = m.content.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }
  }

  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  const topicPatterns: Record<string, RegExp[]> = {
    "Kahve Önerisi": [/öner/i, /tavsiye/i, /ne al/i, /hangisi/i],
    "Sütlü Kahve": [/sütlü/i, /latte/i, /cappuccino/i, /flat white/i],
    "Meyvemsi/Çiçeksi": [/meyvemsi/i, /çiçeksi/i, /çiçek/i, /hafif/i],
    "Çikolatalı/Dolgun": [/çikolata/i, /kakao/i, /dolgun/i, /sert/i],
    "Abonelik": [/abonelik/i, /abone/i, /üyelik/i, /paket/i, /düzenli/i],
    "Demleme Yöntemi": [/demle/i, /v60/i, /french press/i, /moka/i, /aeropress/i],
    "Ekipman": [/ekipman/i, /alet/i, /makine/i, /terazi/i, /değirmen/i],
    "Kargo/Teslimat": [/kargo/i, /teslimat/i, /ne zaman gelir/i, /gönderim/i],
    "Fiyat": [/fiyat/i, /kaç para/i, /ne kadar/i, /pahalı/i, /ucuz/i],
    "Kurumsal/B2B": [/kurumsal/i, /b2b/i, /toptan/i, /ofis/i, /kafe/i, /restoran/i],
    "Kahveni Bul Testi": [/kahveni bul/i, /test/i, /profil/i, /bul/i],
    "Specialty": [/specialty/i, /tek köken/i, /single origin/i],
    "İmza Ürünler": [/imza/i, /signature/i, /özel seçki/i],
    "Saklama/Tazelik": [/saklama/i, /tazelik/i, /raf ömrü/i, /son kullanma/i],
  };

  const topics: Record<string, number> = {};
  for (const [topic, patterns] of Object.entries(topicPatterns)) {
    topics[topic] = 0;
    for (const m of messages) {
      if (patterns.some(p => p.test(m.content))) topics[topic]++;
    }
  }

  const topTopics = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));

  const monthly: Record<string, number> = {};
  for (const m of messages) {
    const key = m.createdAt.toISOString().slice(0, 7);
    monthly[key] = (monthly[key] || 0) + 1;
  }
  const monthlyTrend = Object.entries(monthly)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  return NextResponse.json({
    totalMessages,
    totalConversations: await prisma.chatThread.count(),
    topWords,
    topTopics,
    monthlyTrend,
  });
}
