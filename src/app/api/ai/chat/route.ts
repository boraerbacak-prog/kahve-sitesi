import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kahve-sitesi.vercel.app";

const brewingMethods: Record<string, { name: string; desc: string; link: string }> = {
  v60: { name: "V60 Pour Over", desc: "Hafif ve aromatik. 2-3 dk, 92-96°C, oran 1:15. Kağıt filtre kullanın.", link: `${SITE_URL}/demleme` },
  "french press": { name: "French Press", desc: "Dolgun gövdeli. 4 dk, 93-96°C, oran 1:12. Metal filtreyle yağlar korunur.", link: `${SITE_URL}/demleme` },
  espresso: { name: "Espresso", desc: "Yoğun ve konsantre. 25-30 sn, 90-96°C, oran 1:2. 9 bar basınç.", link: `${SITE_URL}/demleme` },
  "cold brew": { name: "Soğuk Demleme", desc: "Düşük asiditeli, yumuşak. 12-24 saat soğuk suda, oran 1:8.", link: `${SITE_URL}/demleme` },
  aeropress: { name: "Aeropress", desc: "Hızlı ve pratik. 1-2 dk, 85-90°C, oran 1:10.", link: `${SITE_URL}/demleme` },
  "moka pot": { name: "Moka Pot", desc: "İtalyan usulü. 3-5 dk, ~100°C, oran 1:7. Ocak üstü.", link: `${SITE_URL}/demleme` },
};

const subscriptions = [
  { name: "Başlangıç", price: "199", desc: "Ayda 1 paket (250g), her ay farklı çekirdek, ücretsiz kargo" },
  { name: "Keyif", price: "379", desc: "Ayda 2 paket (250g x2), en popüler, özel indirim" },
  { name: "Gurme", price: "549", desc: "Ayda 3 paket (250g x3), specialty seçkiler, öncelikli destek" },
];

const questions: {
  patterns: RegExp[];
  response: (msg: string, products: any[]) => string | null;
}[] = [
  {
    patterns: [/merhaba/i, /selam/i, /hey/i, /günaydın/i, /iyi günler/i],
    response: () =>
      "Merhaba! ☕ Ben **Rostello'nun Baş Baristası**. Size nasıl yardımcı olabilirim?\n\nKahve önerisi, demleme tüyoları, abonelik bilgisi veya sipariş durumu hakkında sorularınızı yanıtlayabilirim.\n\n**Başlamak için:** Kahveyi nasıl içmeyi seversiniz? Sütlü mü, sade mi?",
  },
  {
    patterns: [/nasılsın/i, /naber/i, /naptın/i],
    response: () =>
      "Harikayım, teşekkür ederim! ☕ Rostello'nun başında taze kahveler kavruluyor, damakları şenlendirmek için sabırsızlanıyorum. Size nasıl yardımcı olabilirim?",
  },
  {
    patterns: [/sütlü/i, /latte/i, /cappuccino/i, /flat white/i, /süt/i, /filtre kahve/i],
    response: (msg, products) => {
      const sade = msg.includes("sade") || msg.includes("siyah");
      if (sade) return null;
      const suitable = products.filter((p: any) =>
        p.body === "Full" || p.roastLevel === "dark" || p.roastLevel === "medium"
      ).slice(0, 3);
      if (suitable.length === 0) {
        return "Sütlü içecekler için genelde orta veya koyu kavrum kahveler öneririm. [Tüm kahvelerimize buradan]({url}/urunler) göz atabilirsiniz.".replace("{url}", SITE_URL);
      }
      const list = suitable.map((p: any) =>
        `[${p.name}]({url}/urunler/${p.slug}) — ${p.price.toLocaleString("tr-TR")}₺/kg`.replace("{url}", SITE_URL)
      ).join("\n");
      return `Sütlü kahve severler için önerilerim:\n\n${list}\n\nBu kahveler sütle harika uyum sağlar. Dilerseniz [demleme rehberimize]({url}/demleme) de göz atabilirsiniz.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/meyvemsi/i, /çiçeksi/i, /çiçek/i, /meyve/i, /hafif/i, /ekşi/i, /parlak/i],
    response: (msg, products) => {
      const suitable = products.filter((p: any) =>
        p.acidity === "High" || p.roastLevel === "light" || p.segment === "specialty"
      ).slice(0, 3);
      if (suitable.length === 0) {
        return "Meyvemsi ve çiçeksi notalar için Etiyopya kahvelerine bakmanızı öneririm. [Tüm ürünlerimizi inceleyin]({url}/urunler).".replace("{url}", SITE_URL);
      }
      const list = suitable.map((p: any) =>
        `[${p.name}]({url}/urunler/${p.slug}) — ${p.price.toLocaleString("tr-TR")}₺/kg`.replace("{url}", SITE_URL)
      ).join("\n");
      return `Size en çok yakışacak kahveler:\n\n${list}\n\nBu kahveler meyvemsi ve çiçeksi notalarıyla öne çıkar. Özellikle Etiyopya kökenlileri tavsiye ederim!`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/çikolata/i, /kakao/i, /fındık/i, /karamel/i, /dolgun/i, /sert/i, /gövde/i],
    response: (msg, products) => {
      const suitable = products.filter((p: any) =>
        p.body === "Full" || p.roastLevel === "dark" || (p.roastLevel === "medium" && p.acidity !== "High")
      ).slice(0, 3);
      if (suitable.length === 0) {
        return "Dolgun ve çikolatalı notalar için Guatemala veya Brezilya kahvelerini öneririm. [Koleksiyonumuza göz atın]({url}/urunler).".replace("{url}", SITE_URL);
      }
      const list = suitable.map((p: any) =>
        `[${p.name}]({url}/urunler/${p.slug}) — ${p.price.toLocaleString("tr-TR")}₺/kg`.replace("{url}", SITE_URL)
      ).join("\n");
      return `Size önerdiğim kahveler:\n\n${list}\n\nBu kahveler çikolata, karamel ve fındık notalarıyla damağınızda harika bir tat bırakacak.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/v60.*kahve/i, /french.*press.*kahve/i, /ekipman.*öner/i, /hangi.*ekipman/i, /ekipman.*hangi/i, /moka.*kahve/i, /aeropress.*kahve/i, /cezve.*kahve/i, /filtre.*makine.*kahve/i],
    response: (msg, products) => {
      const lm = msg.toLowerCase();
      let equip = "";
      if (lm.includes("v60")) equip = "v60";
      else if (lm.includes("french") || lm.includes("press")) equip = "french-press";
      else if (lm.includes("moka")) equip = "moka";
      else if (lm.includes("aeropress")) equip = "aeropress";
      else if (lm.includes("cezve")) equip = "cezve";
      else if (lm.includes("soğuk") || lm.includes("cold")) equip = "cold-brew";
      else equip = "general";

      const mapped = products.filter((p: any) => {
        const r = p.roastLevel || "";
        if (equip === "v60") return r === "light" || r === "medium";
        if (equip === "french-press") return r === "medium" || r === "dark";
        if (equip === "moka") return r === "medium" || r === "dark";
        if (equip === "aeropress") return true;
        if (equip === "cezve") return r === "medium" || r === "dark";
        if (equip === "cold-brew") return r === "medium" || r === "dark";
        return true;
      }).slice(0, 3);

      if (mapped.length === 0) {
        return "Size uygun kahve önerebilmem için hangi ekipmanı kullandığınızı söyler misiniz? (V60, French Press, Moka Pot, Aeropress, Cezve, Soğuk Demleme vb.)";
      }
      const list = mapped.map((p: any) =>
        `[${p.name}]({url}/urunler/${p.slug}) — ${p.price.toLocaleString("tr-TR")}₺/kg`.replace("{url}", SITE_URL)
      ).join("\n");
      const equipNames: Record<string, string> = { "v60": "V60", "french-press": "French Press", "moka": "Moka Pot", "aeropress": "Aeropress", "cezve": "Cezve", "cold-brew": "Soğuk Demleme", "general": "ekipmanınız" };
      const equipName = equipNames[equip] || equip;
      return `**${equipName}** için önerdiğim kahveler:\n\n${list}\n\nDetaylı öneri için [Kahveni Bul]({url}/damak-testi) testini yapabilirsiniz.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/ürün/i, /kahve.*ön/i, /tavsiye/i, /öner/i, /hangisini/i, /seç/i, /ne al/i, /karar/i],
    response: (_msg, products) => {
      const featured = products.filter((p: any) => p.featured).slice(0, 4);
      if (featured.length === 0) {
        return "Tüm kahvelerimizi [şuradan]({url}/urunler) inceleyebilirsiniz. Damak tadınızı bilirsem size daha iyi öneri yapabilirim!".replace("{url}", SITE_URL);
      }
      const list = featured.map((p: any) => {
        const notes = p.flavorNotes ? JSON.parse(p.flavorNotes).slice(0, 3).join(", ") : "";
        return `[${p.name}]({url}/urunler/${p.slug}) — ${p.price.toLocaleString("tr-TR")}₺/kg | ${notes}`.replace("{url}", SITE_URL);
      }).join("\n");
      return `Öne çıkan kahvelerimiz:\n\n${list}\n\nHangisi ilginizi çekti? Dilerseniz size özel öneri de yapabilirim — kahveyi nasıl içmeyi seversiniz?`;
    },
  },
  {
    patterns: [/abonelik/i, /üyelik/i, /her ay/i, /düzenli/i, /paket/i, /abone/i],
    response: () => {
      const list = subscriptions.map((s) =>
        `**${s.name}** (${s.price} ₺/ay): ${s.desc}`
      ).join("\n");
      return `Abonelik paketlerimiz:\n\n${list}\n\nTüm paketlerde dilediğiniz zaman iptal hakkınız var. Detaylı bilgi için [Abonelik sayfamızı]({url}/abonelik) ziyaret edebilirsiniz.`.replace("{url}", SITE_URL);
    },
  },
  {
    patterns: [/b2b/i, /kurumsal/i, /toptan/i, /iş birliği/i, /cafe/i, /restoran/i, /otel/i, /ofis/i, /perakende/i],
    response: () =>
      `Kurumsal çözümlerimiz:\n\n• **Perakende Tedarik** — Kafe ve restoranlar için özel çekirdek seçkileri\n• **Toptan Satış** — 5kg+ siparişlerde avantajlı fiyat\n• **Ofis Aboneliği** — Düzenli kahve tedariki\n• **Eğitim & Danışmanlık** — Barista eğitimi ve atölye\n\nDetaylı bilgi için [B2B sayfamızı]({url}/b2b) ziyaret edin veya info@rostello.com adresine e-posta gönderin.`.replace("{url}", SITE_URL),
  },
  {
    patterns: [/fiyat/i, /ne kadar/i, /kaç para/i, /pahalı/i, /ucuz/i, /indirim/i],
    response: (_msg, products) => {
      const sorted = [...products].sort((a: any, b: any) => a.price - b.price);
      const cheapest = sorted.slice(0, 2);
      const expensive = sorted.reverse().slice(0, 2);
      return `Fiyat aralığımız **${sorted[0].price.toLocaleString("tr-TR")}₺** ile **${sorted[sorted.length - 1].price.toLocaleString("tr-TR")}₺** arasında değişiyor.\n\nEn uygun: [${cheapest[0].name}]({url}/urunler/${cheapest[0].slug}) (${cheapest[0].price.toLocaleString("tr-TR")}₺/kg)\nPremium: [${expensive[0].name}]({url}/urunler/${expensive[0].slug}) (${expensive[0].price.toLocaleString("tr-TR")}₺/kg)\n\n[Tüm ürünler]({url}/urunler) için sayfamızı ziyaret edin.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/v60/i, /demle/i, /french press/i, /pour over/i, /filtre/i, /cold brew/i, /moka/i, /aeropress/i],
    response: (msg) => {
      const method = Object.entries(brewingMethods).find(([key]) =>
        msg.toLowerCase().includes(key)
      );
      if (method) {
        return `${method[1].name} ☕\n\n${method[1].desc}\n\nDetaylı anlatım için [Demleme Yöntemleri]({url}/demleme) sayfamıza göz atabilirsiniz.`.replace("{url}", SITE_URL);
      }
      const list = Object.values(brewingMethods).map((m) =>
        `**${m.name}** — ${m.desc.split(".")[0]}.`
      ).join("\n");
      return `Demleme yöntemlerimiz:\n\n${list}\n\nHangisiyle ilgileniyorsunuz? Detaylı anlatım için [Demleme Rehberi]({url}/demleme) sayfamıza bakabilirsiniz.`.replace("{url}", SITE_URL);
    },
  },
  {
    patterns: [/ekipman/i, /alet/i, /malzeme/i, /terazi/i, /kettle/i, /değirmen/i, /kahve makinesi/i],
    response: () =>
      `Ekipmanlarımız:\n\n• [V60 Dripper]({url}/ekipmanlar) — 350 ₺\n• [French Press]({url}/ekipmanlar) — 450 ₺\n• [Aeropress]({url}/ekipmanlar) — 750 ₺\n• [Dijital Terazi]({url}/ekipmanlar) — 890 ₺\n• [Su Isıtıcı]({url}/ekipmanlar) — 1.290 ₺\n• [El Değirmeni]({url}/ekipmanlar) — 1.590 ₺\n\nTüm ekipmanlar için [sayfamızı]({url}/ekipmanlar) ziyaret edin.`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/imza/i, /signature/i, /özel/i, /seçki/i],
    response: () =>
      `İmza ürünlerimiz:\n\n• **Rostello Signature Blend** — 380 ₺\n• **Gece Kavrum** — 350 ₺\n• **Çiçeksi Notalar** — 420 ₺\n• **Çikolata Sevenler İçin** — 360 ₺\n• **Barista Seçkisi** — 550 ₺\n• **Perfect Morning** — 340 ₺\n\nDetaylar için [İmza Ürünler]({url}/imza-urunler) sayfamızı ziyaret edin.`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/sipariş/i, /kargo/i, /teslimat/i, /ne zaman gelir/i, /gönder/i, /adres/i],
    response: () =>
      `Sipariş ve kargo bilgileri:\n\n• Tüm siparişler **24 saat içinde** kavrulup kargoya verilir\n• Taze kavrum garantisi\n• Ücretsiz kargo (aboneliklerde ve belirli tutar üzeri)\n• Paket açılmamış ürünlerde **14 gün** iade hakkı\n\nKargo takibi için sipariş numaranızı paylaşırsanız hemen kontrol ederim.`,
  },
  {
    patterns: [/iade/i, /değişim/i, /geri/i],
    response: () =>
      "İade politikamız: Paket açılmamış ürünlerde 14 gün içinde iade yapabilirsiniz. İade süreci için sipariş numaranızla birlikte info@rostello.com adresine e-posta göndermeniz yeterli.",
  },
  {
    patterns: [/iletişim/i, /ulaş/i, /telefon/i, /email/i, /mail/i, /adres/i],
    response: () =>
      "Bize ulaşın:\n\n• E-posta: info@rostello.com\n• Instagram: @rostello\n\nSorularınız için her zaman buradayız! ☕",
  },
  {
    patterns: [/blog/i, /yazı/i, /makale/i, /içerik/i],
    response: () =>
      `Blogumuzda kahve kültürü, demleme teknikleri ve sektör trendleri hakkında yazılar bulabilirsiniz:\n\n[Blog sayfamızı ziyaret edin]({url}/blog)`.replace("{url}", SITE_URL),
  },
  {
    patterns: [/kahveni bul/i, /kahvemi bul/i, /test/i, /profil/i, /keşfet/i, /bul/i],
    response: () =>
      "Kahveni Bul testi ile size en uygun kahveyi bulalım! 🎯\n\nBirkaç soruyla damak tadınıza ve kullandığınız ekipmana göre özel öneriler sunuyorum.\n\nHemen başlamak için [Kahveni Bul]({url}/damak-testi) sayfasını ziyaret edin.\n\nYa da doğrudan bana sorun:\n• Kahveyi nasıl içersiniz? (sütlü/sade/soğuk)\n• Hangi ekipmanı kullanıyorsunuz?\n• Hangi lezzetleri seversiniz?".replace("{url}", SITE_URL),
  },
  {
    patterns: [/hangi/i, /fark/i, /n[/i]ye/i, /neden/i, /nasıl/i, /ne demek/i, /specialty/i, /arabica/i, /robusta/i],
    response: () => [
      "Specialty coffee, 80 üzeri puan almış, tek köken ve izlenebilir çekirdeklerdir. Rostello olarak specialty ve standart olmak üzere iki segmentte hizmet veriyoruz.",
      "Arabica daha aromatik ve kompleks, Robusta ise daha kafeinli ve güçlüdür. İkisini harmanlayarak dengeli lezzetler de yakalıyoruz.",
      "Tek köken kahve, tek bir bölgeden gelen çekirdeklerdir. Harman ise farklı bölgelerin en iyi yanlarını birleştirir. Hangisini denemek istersiniz?",
    ][Math.floor(Math.random() * 3)],
  },
  {
    patterns: [/teşekkür/i, /sağ ol/i, /eyvallah/i, /thanks/i],
    response: () =>
      "Rica ederim! ☕ Ne zaman kahveyle ilgili bir sorunuz olsa buradayım. [Mağazamıza]({url}/urunler) da bekleriz!".replace("{url}", SITE_URL),
  },
  {
    patterns: [/görüş/i, /bay/i, /hoşça/i, /güle/i],
    response: () =>
      "Hoşça kalın! ☕ Umarım size en uygun kahveyi bulmanıza yardımcı olabilmişimdir. Yeni lezzetlerle tekrar görüşmek üzere!",
  },
];

async function getFallbackReply(msg: string, products: any[]): Promise<string> {
  const lower = msg.toLowerCase();

  for (const q of questions) {
    const match = q.patterns.some((p) => p.test(lower));
    if (match) {
      const result = q.response(msg, products);
      if (result) return result;
    }
  }

  if (products.length > 0) {
    const allProducts = products.map((p: any) =>
      `[${p.name}]({url}/urunler/${p.slug})`.replace("{url}", SITE_URL)
    );
    const sample = allProducts.slice(0, 5).join("\n");

    const fallbacks = [
      `Size en iyi şekilde yardımcı olmak için biraz daha bilgi verebilir misiniz?\n\nKahveyi nasıl içmeyi seversiniz?\n• Sütlü mü, sade mi?\n• Meyvemsi notalar mı, çikolatalı mı?\n• Hafif mi, sert mi?\n\nYa da aşağıdaki konulardan birini seçebilirsiniz:\n[Ürünler]({url}/urunler) · [Abonelik]({url}/abonelik) · [Demleme]({url}/demleme) · [B2B]({url}/b2b)`.replace(/\{url\}/g, SITE_URL),
      `Anladım. Size daha iyi yardımcı olabilmem için bir sorum var:\n\nKahveyi hangi amaçla kullanacaksınız?\n• Günlük içim\n• Özel günler için\n• Hediye\n• Ofis / iş yeri\n\n[Ürünlerimize]({url}/urunler) göz atabilir veya bana biraz daha detay verebilirsiniz.`.replace(/\{url\}/g, SITE_URL),
      `Öne çıkan ürünlerimizden bazıları:\n\n${sample}\n\nBunlardan herhangi biri ilginizi çekti mi? Ya da size özel bir öneri yapmamı ister misiniz?`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  const noDbFallbacks = [
    `Harika bir soru! Size yardımcı olmak için şu konularda bilgi verebilirim:\n\n☕ [Tüm Kahveler]({url}/urunler)\n☕ [Demleme Yöntemleri]({url}/demleme)\n📦 [Abonelik]({url}/abonelik)\n🏢 [B2B]({url}/b2b)\n📝 [Blog]({url}/blog)\n\nHangi konuda bilgi almak istersiniz?`.replace(/\{url\}/g, SITE_URL),
    `Rostello'ya hoş geldiniz! ☕\n\nSize nasıl yardımcı olabilirim?\n\n• **Kahve önerisi** için kahveyi nasıl içmeyi sevdiğinizi anlatın\n• **Demleme tüyoları** için yöntem adını söyleyin\n• **Abonelik** için paket bilgisi vereyim\n• **Kurumsal** için B2B çözümlerimizi anlatayım`,
  ];
  return noDbFallbacks[Math.floor(Math.random() * noDbFallbacks.length)];
}

function hasOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key !== "dummy-key" && key.length > 10;
}

export async function POST(req: Request) {
  let message = "";
  let threadId: string | null = null;
  try {
    const body = await req.json();
    message = body.message || "";
    threadId = body.threadId || null;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });
  }

  try {
    let session: any = null;
    try { session = await auth(); } catch {}

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: { published: true },
        include: { category: true },
      });
    } catch (dbError) {
      console.error("DB error in AI chat:", dbError);
    }

    let reply: string;
    let currentThreadId = threadId;

    if (hasOpenAIKey() && products.length > 0) {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const productCatalog = products.map((p) =>
        `- ${p.name} — ${p.origin || "Menşei bilinmiyor"} | ${p.category.name} | ${p.price.toLocaleString("tr-TR")}₺/kg | Kavrum: ${p.roastLevel === "light" ? "Hafif" : p.roastLevel === "medium" ? "Orta" : "Koyu"} | Detay: ${SITE_URL}/urunler/${p.slug}`
      ).join("\n");

      const SYSTEM_PROMPT = [
        `SEN ROSTELLO'NUN BAŞ BARISTASISIN.`,
        `KİŞİLİK: Kibar, uzman, tutkulu, çözüm odaklı. Satış temsilcisi değil, kahve rehberi gibi konuş. Türkçe konuş.`,
        `GÖREVLERİN:`,
        `1. MÜŞTERİ ANALİZİ: Kahveyi nasıl sevdiğini sor (sütlü/sert/meyvemsi/çikolatalı).`,
        `2. KAHVE ÖNERİSİ: Katalogdaki ürünlere göre öner, link ver.`,
        `3. SİTE HAKİMİYETİ: Demleme, abonelik, B2B sayfalarına yönlendir.`,
        `4. TEKNİK DESTEK: Demleme ekipmanları hakkında tüyo ver.`,
        `KISITLAMALAR: Rostello dışı markaları övme. Kargo takibi sorulursa sipariş no iste. Linklerde tam URL kullan.`,
        ``,
        `Site Sayfaları:`,
        `- Ana Sayfa: ${SITE_URL}/`,
        `- Kahveler: ${SITE_URL}/urunler`,
        `- İmza Ürünler: ${SITE_URL}/imza-urunler`,
        `- Ekipmanlar: ${SITE_URL}/ekipmanlar`,
        `- Damak Testi: ${SITE_URL}/damak-testi`,
        `- Demleme: ${SITE_URL}/demleme`,
        `- Abonelik: ${SITE_URL}/abonelik`,
        `- B2B: ${SITE_URL}/b2b`,
        `- Blog: ${SITE_URL}/blog`,
        `- Sepet: ${SITE_URL}/sepet`,
        ``,
        `Abonelik: Başlangıç 199₺/ay, Keyif 379₺/ay, Gurme 549₺/ay.`,
        `Sipariş: 24 saat içinde kavrulup kargoya verilir. 14 gün iade.`,
        ``,
        `Ürün Kataloğu:`,
        productCatalog,
      ].join("\n");

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (threadId && session?.user?.id) {
        const chatHistory = await prisma.chatMessage.findMany({
          where: { thread: { id: threadId, userId: session.user.id } },
          orderBy: { createdAt: "asc" },
          take: 20,
        });
        for (const msg of chatHistory) {
          messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
        }
      }

      messages.push({ role: "user", content: message });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 800,
      });

      reply = completion.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu.";
    } else {
      reply = await getFallbackReply(message, products);
    }

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
    console.error("AI chat error:", error?.message || error, "Message was:", message);
    let fallbackReply = "Üzgünüm, bir teknik aksaklık yaşıyorum. Lütfen biraz sonra tekrar dener misiniz? ☕";
    try {
      fallbackReply = await getFallbackReply(message || "merhaba", []);
    } catch {}
    return NextResponse.json({ reply: fallbackReply, threadId: null });
  }
}
