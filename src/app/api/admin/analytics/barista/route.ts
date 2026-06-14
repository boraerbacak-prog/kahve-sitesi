import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [userMessages, allMessages, threads] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { role: "user", createdAt: { gte: sixMonthsAgo } },
      select: { content: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.chatMessage.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { role: true, content: true, createdAt: true, threadId: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.chatThread.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { id: true, createdAt: true, messages: { select: { role: true, content: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalMessages = userMessages.length;
  const totalConversations = threads.length;

  // Word frequency
  const wordCounts: Record<string, number> = {};
  for (const m of userMessages) {
    const words = m.content.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
    for (const w of words) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }
  }
  const topWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 50);

  // Topic patterns
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
    "Selamlaşma": [/merhaba/i, /selam/i, /iyi günler/i, /kolay gelsin/i],
    "Şikayet/Sorun": [/şikayet/i, /sorun/i, /hata/i, /çalışmıyor/i, /bozuk/i],
  };

  const topics: Record<string, number> = {};
  for (const [topic, patterns] of Object.entries(topicPatterns)) {
    topics[topic] = 0;
    for (const m of userMessages) {
      if (patterns.some(p => p.test(m.content))) topics[topic]++;
    }
  }
  const topTopics = Object.entries(topics).sort((a, b) => b[1] - a[1]).map(([topic, count]) => ({ topic, count }));

  // Monthly trend
  const monthly: Record<string, number> = {};
  for (const m of userMessages) {
    const key = m.createdAt.toISOString().slice(0, 7);
    monthly[key] = (monthly[key] || 0) + 1;
  }
  const monthlyTrend = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ month, count }));

  // Engagement metrics
  let totalUserMsgs = 0;
  let totalAssistantMsgs = 0;
  for (const m of allMessages) {
    if (m.role === "user") totalUserMsgs++;
    else totalAssistantMsgs++;
  }
  const avgMessagesPerConversation = totalConversations > 0 ? ((totalUserMsgs + totalAssistantMsgs) / totalConversations).toFixed(1) : "0";
  const avgUserMessagesPerConversation = totalConversations > 0 ? (totalUserMsgs / totalConversations).toFixed(1) : "0";

  // Recent activity (last 30 days vs before)
  const recentMessages = userMessages.filter(m => m.createdAt >= oneMonthAgo).length;
  const olderMessages = userMessages.filter(m => m.createdAt < oneMonthAgo && m.createdAt >= sixMonthsAgo).length;

  // Detect unanswered/fallback patterns in assistant messages
  const fallbackPatterns = [/üzgünüm/i, /anlamadım/i, /tekrar/i, /net değil/i, /sormak/i];
  let fallbackCount = 0;
  for (const m of allMessages) {
    if (m.role === "assistant" && fallbackPatterns.some(p => p.test(m.content))) {
      fallbackCount++;
    }
  }
  const fallbackRate = totalAssistantMsgs > 0 ? ((fallbackCount / totalAssistantMsgs) * 100).toFixed(1) : "0";

  // Hourly activity
  const hourlyCounts: Record<string, number> = {};
  for (let h = 0; h < 24; h++) hourlyCounts[String(h)] = 0;
  
  const oneWeekMessages = userMessages.filter(m => m.createdAt >= oneWeekAgo);
  for (const m of oneWeekMessages) {
    const hour = String(new Date(m.createdAt).getHours());
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
  }
  const peakHour = Object.entries(hourlyCounts).sort((a, b) => b[1] - a[1])[0];

  // Weekly activity
  const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const dailyCounts: Record<string, number> = {};
  for (const d of dayNames) dailyCounts[d] = 0;
  for (const m of oneWeekMessages) {
    const day = dayNames[new Date(m.createdAt).getDay()];
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  }

  return NextResponse.json({
    totalMessages,
    totalConversations,
    totalUserMsgs,
    totalAssistantMsgs,
    avgMessagesPerConversation: parseFloat(avgMessagesPerConversation),
    avgUserMessagesPerConversation: parseFloat(avgUserMessagesPerConversation),
    recentMessages,
    olderMessages,
    fallbackRate: parseFloat(fallbackRate),
    fallbackCount,
    peakHour: peakHour ? { hour: peakHour[0], count: peakHour[1] } : null,
    hourlyCounts,
    dailyCounts,
    activeUsers: {},
    topWords,
    topTopics,
    monthlyTrend,
  });
}
