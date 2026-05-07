import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

const SYSTEM_PROMPT = `Sen Kahveci'nin AI Baristasısın. Görevin:
- Müşterilere kahve önermek
- Kahve çeşitleri, kavrum dereceleri ve demleme yöntemleri hakkında bilgi vermek
- Nazik, samimi ve kahve konusunda tutkulu olmak
- Türkçe konuşmak

Mevcut ürünler:
`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { message, threadId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { published: true },
      include: { category: true },
    });

    const productCatalog = products.map((p: { name: string; category: { name: string }; price: number; weight: number | null; origin: string | null; roastLevel: string | null }) =>
      `- ${p.name} (${p.category.name}): ${p.price.toFixed(2)}₺, ${p.weight}g, ${p.origin || "Belirtilmemiş"}, kavrum: ${p.roastLevel || "Belirtilmemiş"}`
    ).join("\n");

    let messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT + productCatalog },
    ];

    let currentThreadId = threadId;

    if (threadId && session?.user?.id) {
      const chatHistory = await prisma.chatMessage.findMany({
        where: { thread: { id: threadId, userId: session.user.id } },
        orderBy: { createdAt: "asc" },
        take: 20,
      });

      for (const msg of chatHistory) {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu.";

    if (session?.user?.id) {
      if (!currentThreadId) {
        const thread = await prisma.chatThread.create({
          data: {
            title: message.slice(0, 50),
            userId: session.user.id,
            messages: {
              create: [
                { role: "user", content: message },
                { role: "assistant", content: reply },
              ],
            },
          },
        });
        currentThreadId = thread.id;
      } else {
        await prisma.chatMessage.createMany({
          data: [
            { threadId: currentThreadId, role: "user", content: message },
            { threadId: currentThreadId, role: "assistant", content: reply },
          ],
        });
      }
    }

    return NextResponse.json({ reply, threadId: currentThreadId });
  } catch (error: any) {
    console.error("AI error:", error);
    if (error?.code === "insufficient_quota" || error?.status === 429) {
      return NextResponse.json({
        reply: "☕ API kotamız doldu. Lütfen daha sonra tekrar dene!",
        threadId: null,
      });
    }
    return NextResponse.json(
      { error: "AI servisi çalışmıyor. Lütfen daha sonra tekrar dene." },
      { status: 500 }
    );
  }
}
