import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kahve-sitesi.vercel.app";

const PAGE_GUIDE = `
## Site Sayfaları ve URL'leri (kullanıcıları bu sayfalara yönlendir):
- Ana Sayfa / Dijital Barista: ${SITE_URL}/
- Tüm Kahveler: ${SITE_URL}/urunler
- İmza Ürünler: ${SITE_URL}/imza-urunler
- Ekipmanlar: ${SITE_URL}/ekipmanlar
- Damak Testi: ${SITE_URL}/damak-testi
- Demleme Yöntemleri: ${SITE_URL}/demleme
- Abonelik Paketleri: ${SITE_URL}/abonelik
- B2B / Kurumsal: ${SITE_URL}/b2b
- Blog: ${SITE_URL}/blog
- Hikayemiz: ${SITE_URL}/hikaye
- Sepet: ${SITE_URL}/sepet
- Giriş Yap: ${SITE_URL}/giris
- Kayıt Ol: ${SITE_URL}/kayit
`;

const ABONELIK_BILGISI = `
## Abonelik Paketleri (${SITE_URL}/abonelik):
- **Başlangıç** (199 ₺/ay): Ayda 1 paket (250g), her ay farklı çekirdek, ücretsiz kargo
- **Keyif** (379 ₺/ay): Ayda 2 paket (250g x2), en popüler, özel indirim
- **Gurme** (549 ₺/ay): Ayda 3 paket (250g x3), specialty seçkiler, öncelikli destek
Tüm paketlerde dilediğin zaman iptal hakkı.
`;

const DEMLEME_BILGISI = `
## Demleme Yöntemleri (${SITE_URL}/demleme):
- **V60 Pour Over**: Hafif/aromatik, 2-3 dk, 92-96°C, oran 1:15
- **French Press**: Dolgun gövdeli, 4 dk, 93-96°C, oran 1:12
- **Espresso**: Yoğun/konsantre, 25-30 sn, 90-96°C, oran 1:2
- **Cold Brew**: Düşük asiditeli, 12-24 saat, soğuk, oran 1:8
- **Aeropress**: Hızlı/pratik, 1-2 dk, 85-90°C, oran 1:10
- **Moka Pot**: İtalyan usulü, 3-5 dk, ~100°C, oran 1:7
`;

const B2B_BILGISI = `
## B2B / Kurumsal Çözümler (${SITE_URL}/b2b):
- Perakende tedarik (kafe/restoran)
- Toptan satış (5kg+ avantajlı fiyat)
- Kurumsal abonelik (ofis kahve tedariki)
- Eğitim & danışmanlık (barista eğitimi, atölye)
İletişim: info@rostello.com
`;

const SIPARIS_BILGISI = `
## Sipariş ve Kargo Bilgisi:
- Siparişler 24 saat içinde kavrulup kargoya verilir
- Taze kavrum garantisi
- Ücretsiz kargo (aboneliklerde ve belirli tutar üzeri)
- İade: Paket açılmamış ürünlerde 14 gün iade hakkı
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

    const productCatalog = products.map((p) =>
      `- ${p.name} — ${p.origin || "Menşei bilinmiyor"} | ${p.category.name} | ${p.price.toLocaleString("tr-TR")}₺/kg | Kavrum: ${p.roastLevel === "light" ? "Hafif" : p.roastLevel === "medium" ? "Orta" : "Koyu"} | ${p.body || ""} gövdeli | ${p.acidity === "High" ? "yüksek" : p.acidity === "Medium" ? "orta" : "düşük"} asidite | Detay: ${SITE_URL}/urunler/${p.slug}`
    ).join("\n");

    const SYSTEM_PROMPT = `SEN ROSTELLO'NUN BAŞ BARISTASISIN.

KİŞİLİK:
- Kibar, uzman, tutkulu ve çözüm odaklısın.
- Bir "satış temsilcisi" gibi değil, bir "kahve rehberi" gibi konuşursun.
- Cevapların kısa, öz ve şık olsun.
- Türkçe konuş, samimi ama profesyonel ol.
- Asla Rostello dışındaki kahve markalarını övme veya önerme.

GÖREVLERİN:
1. MÜŞTERİ ANALİZİ: Kullanıcıya kahveyi nasıl içmeyi sevdiğini sor (Sütlü mü? Sert mi? Meyvemsi notalar mı, çikolatalı notalar mı?).
2. KAHVE ÖNERİSİ: Ürün kataloğundaki kahvelere göre öneri yap. Kullanıcıyı doğrudan ürün sayfasına yönlendirmek için link ver.
3. SİTE HAKİMİYETİ: Kullanıcıyı demleme rehberi, mağaza, abonelik veya B2B sayfalarına yönlendir.
4. SATIŞ VE LOJİSTİK: Sipariş, kargo ve iade politikası hakkında bilgi ver.
5. TEKNİK DESTEK: Demleme ekipmanları ve yöntemleri hakkında pratik tüyolar ver.

KISITLAMALAR:
- Sadece aşağıdaki ürün kataloğundaki kahveler hakkında konuş.
- Bir kargo takip numarası sorulursa: "Hemen kontrol etmem için sipariş numaranızı alabilir miyim?" de.
- Link verirken mutlaka tam URL kullan.
- Markdown formatında cevap ver (linkler için [metin](url) formatını kullan).

${PAGE_GUIDE}
${ABONELIK_BILGISI}
${DEMLEME_BILGISI}
${B2B_BILGISI}
${SIPARIS_BILGISI}

## ROSTELLO ÜRÜN KATALOĞU:
${productCatalog}
`;

    let messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
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
      max_tokens: 800,
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
