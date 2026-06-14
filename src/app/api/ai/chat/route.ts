import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kahve-sitesi.vercel.app";

// Product cache — avoids DB query on every request
let productCache: { data: any[]; time: number } | null = null;
const CACHE_TTL = 120_000;

async function getProducts(): Promise<any[]> {
  if (productCache && Date.now() - productCache.time < CACHE_TTL) {
    return productCache.data;
  }
  try {
    const data = await prisma.product.findMany({
      where: { published: true },
      include: { category: true },
    });
    productCache = { data, time: Date.now() };
    return data;
  } catch {
    return [];
  }
}

const FALLBACK_PRODUCTS = [
  { name: "Guatemala SHB 18 SC", slug: "guatemala-shb-18-sc", price: 1377.62, roastLevel: "medium", body: "Full", acidity: "Medium", flavorNotes: '["kakao","baharat","fındık"]', origin: "Guatemala", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Guatemala", slug: "guatemala", price: 1355.05, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["karamel","badem","sütlü çikolata"]', origin: "Guatemala", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Colombia Supremo 18 SC", slug: "colombia-supremo-18-sc", price: 1363.73, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["karamel","kırmızı meyve","çikolata"]', origin: "Colombia", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Brasil Mogiana", slug: "brasil-mogiana", price: 1304.69, roastLevel: "medium", body: "Full", acidity: "Low", flavorNotes: '["fındık","çikolata","karamel"]', origin: "Brezilya", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Rio Minas 17-18 2/3 (TK)", slug: "rio-minas", price: 1012.97, roastLevel: "medium", body: "Medium", acidity: "Low", flavorNotes: '["çikolata","fındık","tahıl"]', origin: "Brezilya", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Sidamo G2", slug: "ethiopia-sidamo-g2", price: 1309.03, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["çiçek","limon","bergamot"]', origin: "Etiyopya", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Sidamo G4", slug: "ethiopia-sidamo-g4", price: 1104.13, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["yasemin","limon","çiçek"]', origin: "Etiyopya", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Lekempt G4", slug: "ethiopia-lekempt-g4", price: 947.85, roastLevel: "light", body: "Light", acidity: "Medium", flavorNotes: '["çiçek","şeftali","çay"]', origin: "Etiyopya", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Rwanda Kula Project", slug: "rwanda-kula-project", price: 1104.13, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["çilek","vişne","pembe meyveler"]', origin: "Ruanda", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Rwanda Impexcor", slug: "rwanda-impexcor", price: 1149.28, roastLevel: "light", body: "Medium", acidity: "Medium", flavorNotes: '["kırmızı meyve","karamel","pembe meyveler"]', origin: "Ruanda", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Peru Grade 1", slug: "peru-grade-1", price: 1373.28, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["fındık","çikolata","portakal"]', origin: "Peru", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Venezuela", slug: "venezuela", price: 1134.52, roastLevel: "medium", body: "Medium", acidity: "Low", flavorNotes: '["badem","sütlü çikolata","fındık"]', origin: "Venezuela", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Honduras", slug: "honduras", price: 1377.62, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["kavun","bal","karamel"]', origin: "Honduras", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Costa Rica Terrazu", slug: "costa-rica-terrazu", price: 1373.28, roastLevel: "medium", body: "Medium", acidity: "High", flavorNotes: '["portakal","bal","kırmızı meyve"]', origin: "Kosta Rika", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Uganda Robusta", slug: "uganda-robusta", price: 826.30, roastLevel: "dark", body: "Full", acidity: "Low", flavorNotes: '["bitter","fındık","kakao"]', origin: "Uganda", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Yirga Koke Honey G1", slug: "ethiopia-yirga-koke-honey-g1", price: 2218.00, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["çiçek","bal","bergamot"]', origin: "Etiyopya", featured: true, category: { name: "Specialty" } },
  { name: "Ethiopia Chelbessa Danche G1", slug: "ethiopia-chelbessa-danche-g1", price: 1927.14, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["yasemin","limon","çiçek"]', origin: "Etiyopya", featured: true, category: { name: "Specialty" } },
  { name: "Ethiopia Ariacha G1", slug: "ethiopia-ariacha-g1", price: 2263.58, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["şeftali","çiçek","bergamot"]', origin: "Etiyopya", featured: false, category: { name: "Specialty" } },
  { name: "Colombia La Roca Pink Bourbon", slug: "colombia-la-roca-pink-bourbon", price: 3494.29, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["pembe meyveler","çiçek","bal"]', origin: "Colombia", featured: true, category: { name: "Specialty" } },
  { name: "Colombia El Paraiso", slug: "colombia-el-paraiso", price: 3031.96, roastLevel: "light", body: "Medium", acidity: "High", flavorNotes: '["kırmızı meyve","karamel","pembe meyveler"]', origin: "Colombia", featured: false, category: { name: "Specialty" } },
  { name: "Colombia La Reserva", slug: "colombia-la-reserva", price: 3026.53, roastLevel: "light", body: "Medium", acidity: "Medium", flavorNotes: '["kırmızı meyve","çiçek","bal"]', origin: "Colombia", featured: false, category: { name: "Specialty" } },
];

function fmtPrice(price: any): string {
  const n = typeof price === "number" ? price : Number(price) || 0;
  return n.toLocaleString("tr-TR");
}

function plink(name: string, slug: string, price: any) {
  return `[${name}]({url}/urunler/${slug}) — ${fmtPrice(price)}₺/kg`.replace("{url}", SITE_URL);
}

function pnotes(p: any): string {
  try { return JSON.parse(p.flavorNotes).slice(0, 3).join(", "); } catch { return ""; }
}

const brewingMethods: Record<string, { name: string; desc: string }> = {
  v60: { name: "V60 Pour Over", desc: "Hafif ve aromatik. 2-3 dk, 92-96°C, oran 1:15. Kağıt filtre kullanın." },
  "french press": { name: "French Press", desc: "Dolgun gövdeli. 4 dk, 93-96°C, oran 1:12. Metal filtreyle yağlar korunur." },
  espresso: { name: "Espresso", desc: "Yoğun ve konsantre. 25-30 sn, 90-96°C, oran 1:2. 9 bar basınç." },
  "cold brew": { name: "Soğuk Demleme", desc: "Düşük asiditeli, yumuşak. 12-24 saat soğuk suda, oran 1:8." },
  aeropress: { name: "Aeropress", desc: "Hızlı ve pratik. 1-2 dk, 85-90°C, oran 1:10." },
  "moka pot": { name: "Moka Pot", desc: "İtalyan usulü. 3-5 dk, ~100°C, oran 1:7. Ocak üstü." },
};

const subscriptions = [
  { name: "Başlangıç", price: "", desc: "1 paket (250g), hafif tüketenler için ideal" },
  { name: "Keyif", price: "", desc: "2 paket (250g x2), en popüler seçenek" },
  { name: "Gurme", price: "", desc: "3 paket (250g x3), specialty seçkiler dahil" },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

interface KahveState {
  step: number;
  answers: string[];
}

const kahveStateMap = new Map<string | null | undefined, KahveState>();

function generateKahveRecommendation(answers: string[], products: any[]): string {
  const lower = answers.map(a => a.replace(/İ/g, "i").toLowerCase()).join(" ");
  const equipment = answers[0]?.toLowerCase() || "";
  const milkPref = answers[1]?.toLowerCase() || "";
  const flavorPref = answers[2]?.toLowerCase() || "";
  const freqPref = answers[3]?.toLowerCase() || "";

  let filtered = products.filter((p: any) => {
    const r = p.roastLevel || "";
    const b = p.body || "";
    const a = p.acidity || "";

    if (equipment.includes("v60") || equipment.includes("filtre") || equipment.includes("pour")) {
      if (r === "dark" && b !== "Full") return false;
    }
    if (equipment.includes("espresso") && r === "light") return false;
    if ((equipment.includes("french") || equipment.includes("press") || equipment.includes("moka")) && r === "light") return false;
    if (equipment.includes("soğuk") || equipment.includes("cold")) {
      if (r === "light") return false;
    }

    if (milkPref.includes("sütlü") || milkPref.includes("latte") || milkPref.includes("sut") || milkPref.includes("süt")) {
      if (r !== "medium" && r !== "dark" && b !== "Full") return false;
    }
    if (milkPref.includes("soğuk") || milkPref.includes("cold") || milkPref.includes("buzlu") || milkPref.includes("iced")) {
      if (r === "light") return false;
    }

    if (flavorPref.includes("meyvemsi") || flavorPref.includes("meyven") || flavorPref.includes("çiçek") || flavorPref.includes("hafif") || flavorPref.includes("parlak") || flavorPref.includes("asidite")) {
      if (a !== "High" && r !== "light") return false;
    }
    if (flavorPref.includes("çikolata") || flavorPref.includes("dolgun") || flavorPref.includes("sert") || flavorPref.includes("yoğun")) {
      if (r !== "dark" && b !== "Full") return false;
    }
    if (flavorPref.includes("dengeli") || flavorPref.includes("tatlı") || flavorPref.includes("karamel")) {
      if (r === "light" && a !== "Low") return false;
    }

    return true;
  });

  if (filtered.length === 0) filtered = products.slice(0, 4);

  const top = filtered.slice(0, 2);
  const top1 = top[0];
  const top2 = top.length > 1 ? top[1] : null;

  const grindMap: Record<string, string> = {
    v60: "Orta-ince öğütme", "french": "Kaba öğütme", "espresso": "İnce öğütme",
    moka: "Orta-ince öğütme", aeropress: "Orta öğütme", cezve: "Toz öğütme",
    "soğuk": "Çok kaba öğütme", "cold": "Çok kaba öğütme",
  };
  let grind = "Orta öğütme";
  for (const [key, val] of Object.entries(grindMap)) {
    if (equipment.includes(key)) { grind = val; break; }
  }

  function fn(p: any): string {
    let notes: string[] = [];
    try { notes = JSON.parse(p.flavorNotes); } catch {}
    const price = typeof p.price === "number" ? p.price : Number(p.price) || 0;
    return `[${p.name}]({url}/urunler/${p.slug}) — ${p.origin || "Menşei bilinmiyor"} · ${notes.slice(0, 2).join(", ")} · ${fmtPrice(price)}₺/kg`;
  }

  const freqMsg = (() => {
    if (freqPref.includes("1") || freqPref.includes("bir")) return "\n\n**Başlangıç** paketimizi öneririm: ayda 1 paket (250g), hafif ve düzenli tüketenler için ideal.";
    if (freqPref.includes("2") || freqPref.includes("3") || freqPref.includes("iki") || freqPref.includes("üç")) return "\n\n**Keyif** paketi tam size göre: ayda 2 paket (250g x2), en popüler seçeneğimiz!";
    if (freqPref.includes("4") || freqPref.includes("5") || freqPref.includes("fazla") || freqPref.includes("çok") || freqPref.includes("fincan")) return "\n\n**Gurme** paketimizi öneririm: ayda 3 paket (250g x3), specialty seçkiler dahil.";
    return "\n\nAbonelik paketlerimizle tanışmak ister misiniz? [Abonelik]({url}/abonelik)".replace("{url}", SITE_URL);
  })();

  return `**Sana en uygun kahveyi buldum!** 🎯\n\n**Ana Öneri:** ${fn(top1)}\n→ Neden bu: ${top1.roastLevel === "light" ? "Zarif ve aromatik" : top1.roastLevel === "dark" ? "Karakterli ve yoğun" : "İdeal ve herkese uygun"} bir profil. ${equipment.includes("v60") ? "V60 ile parlak asiditeleri harika açılıyor." : equipment.includes("french") || equipment.includes("press") ? "French Press ile yağlı gövdeli bir fincan vaat ediyor." : "Ekipmanınızla mükemmel uyum sağlar."}\n→ Öğütme: **${grind}**\n→ Ürün: [${top1.name}]({url}/urunler/${top1.slug})${freqMsg}\n\n${top2 ? `**Alternatif:** ${fn(top2)}\n→ Ürün: [${top2.name}]({url}/urunler/${top2.slug})\n` : ""}\n**Demleme İpucu:** ☕\n• Su sıcaklığı: 92-96°C\n• Oran: 1:15-1:17 (kahve:su)\n• Taze çekilmiş kahve kullanın\n\n[Tüm ürünler]({url}/urunler) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL);
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Günaydın!";
  if (h < 18) return "Tünaydın!";
  return "İyi akşamlar!";
}

function validateAIResponse(reply: string, products: any[]): boolean {
  const lower = reply.toLowerCase();

  const forbiddenBrands = /starbucks|kahve dünyası|mehmet efendi|nescafe|jacobs|lavazza|illy|segafredo|tchibo|costa|peet.s|caribou|dunkin/i;
  if (forbiddenBrands.test(lower)) return false;

  const externalUrlPattern = /https?:\/\/(?!localhost|kahve-sitesi\.vercel\.app)[^\s"')]+/gi;
  if (externalUrlPattern.test(reply)) return false;

  const productLinks = reply.match(/\/urunler\/([a-z0-9-]+)/gi);
  if (productLinks) {
    const slugs = products.map(p => p.slug);
    for (const link of productLinks) {
      const slug = link.replace("/urunler/", "");
      if (!slugs.includes(slug)) return false;
    }
  }

  const markdownLinks = reply.match(/\[([^\]]+)\]\(\/urunler\/([a-z0-9-]+)\)/g);
  if (markdownLinks) {
    for (const ml of markdownLinks) {
      const m = ml.match(/\[([^\]]+)\]\(\/urunler\/([a-z0-9-]+)\)/);
      if (m) {
        const linkName = m[1].toLowerCase();
        const linkSlug = m[2];
        const matchingProduct = products.find((p: any) => p.slug === linkSlug);
        if (matchingProduct && matchingProduct.name.toLowerCase() !== linkName) {
          return false;
        }
      }
    }
  }

  const equipLinks = reply.match(/\/ekipmanlar\/([a-z0-9-]+)/gi);
  if (equipLinks) {
    const equipSlugs = ["v60-dripper", "french-press", "aeropress", "dijital-terazi", "su-isitici", "el-degirmeni"];
    for (const link of equipLinks) {
      const slug = link.replace("/ekipmanlar/", "");
      if (!equipSlugs.includes(slug)) return false;
    }
  }

  const knownProductNames = products.map(p => p.name.toLowerCase());
  const namePattern = /[A-ZİÇŞĞÖÜ][a-zğıçşöü]+(?:\s[A-ZİÇŞĞÖÜ][a-zğıçşöü]+)*/g;
  const properNouns = reply.match(namePattern);
  if (properNouns) {
    const suspicious = properNouns.filter(n => {
      const lowerN = n.toLowerCase();
      if (lowerN === "stello" || lowerN === "rostello" || lowerN === "v60" || lowerN === "aeropress") return false;
      if (lowerN.includes("türk") || lowerN.includes("french") || lowerN.includes("moka") || lowerN.includes("cezve")) return false;
      if (lowerN.length < 4) return false;
      const ulkeVeBolge = /etiyopya|brezilya|kolombiya|guatemala|ruanda|peru|venezuela|honduras|kosta rika|uganda|kenya|meksika|hindistan|endonezya|yamanya/i;
      if (ulkeVeBolge.test(lowerN)) return false;
      return !knownProductNames.some(k => k.includes(lowerN) || lowerN.includes(k));
    });
    if (suspicious.length >= 3) return false;
  }

  return true;
}

function fmtProd(p: any): string {
  const n = pnotes(p);
  return `${plink(p.name, p.slug, p.price)}${n ? " | " + n : ""}`;
}

const faqAnswers: Record<string, string> = {
  "nasıl sakla": "Kahvenizi hava geçirmez bir kapta, serin ve karanlık bir yerde saklayın. Buzdolabında saklamayın! Kavrumdan sonra 2-4 hafta içinde tüketmenizi öneririz.",
  "saklama": "Kahvenizi hava geçirmez bir kapta, serin ve karanlık bir yerde saklayın. Buzdolabında saklamayın! Kavrumdan sonra 2-4 hafta içinde tüketmenizi öneririz.",
  "ne kadar gider": "Taze kavrum kahve, kavrumdan sonra 2-4 hafta içinde en iyi lezzetini korur. Hava geçirmez kapta saklarsanız bu süre uzayabilir.",
  "son kullanma": "Taze kavrum kahve, kavrumdan sonra 2-4 hafta içinde en iyi lezzetini korur. Hava geçirmez kapta saklarsanız bu süre uzayabilir.",
  "hangi kahve": "Damak tadınıza bağlı! Sütlü içecekler için orta/koyu kavrum, sade içim için hafif/orta kavrum öneririz. Bana '**Bana kahve öner**' yazarsanız size özel öneri yapabilirim.",
  "önerir misin": "Size nasıl bir kahve lazım? Sütlü mü, sade mi? Meyvemsi mi, çikolatalı mı? Hangi ekipmanı kullanıyorsunuz? Biraz detay verirseniz size özel öneri yapayım! Ya da '**Bana kahve öner**' yazın, sohbet içinde çözelim.",
  "hangi yöntem": "Pratik bir çözüm istiyorsanız French Press veya Aeropress, aromatik bir deneyim istiyorsanız V60, yoğun kahve için Moka Pot veya espresso makinesi öneririz.",
  "nasıl demle": "Hangi ekipmanı kullanıyorsunuz? V60, French Press, Moka Pot, Aeropress... Her yöntemin detaylı anlatımı için [Demleme Rehberi]({url}/demleme) sayfamıza göz atabilirsiniz.",
  "kurumsal": "Evet! Kafe, restoran, ofis ve oteller için özel çözümlerimiz var. Detaylı bilgi için [B2B]({url}/b2b) sayfamızı ziyaret edin veya info@rostello.com adresine yazın.",
  "toptan": "Evet! Kafe, restoran, ofis ve oteller için özel çözümlerimiz var. Detaylı bilgi için [B2B]({url}/b2b) sayfamızı ziyaret edin veya info@rostello.com adresine yazın.",
  "specialty": "Specialty coffee, 80 üzeri puan almış, tek köken ve izlenebilir çekirdeklerdir. Rostello'da hem specialty hem de standart segmentte kahveler sunuyoruz. [Specialty kahvelerimizi inceleyin]({url}/urunler).",
  "ne demek": "Specialty coffee: 80+ puanlı, tek köken, izlenebilir çekirdek. Arabica daha aromatik, Robusta daha kafeinli. Tek köken tek bölgeden, harman farklı bölgelerin karışımıdır.",
  "iade": "Paket açılmamış ürünlerde 14 gün içinde iade yapabilirsiniz. İade için sipariş numaranızla info@rostello.com adresine e-posta göndermeniz yeterli.",
  "değişim": "Paket açılmamış ürünlerde 14 gün içinde iade/değişim yapabilirsiniz. Detaylar için info@rostello.com adresine yazın.",
  "kargo": "Tüm siparişler 24 saat içinde kavrulup kargoya verilir. Aboneliklerde ve belirli tutar üzeri siparişlerde kargo ücretsizdir.",
  "ücretsiz kargo": "Aboneliklerde ve belirli tutar üzeri siparişlerde kargo ücretsizdir. 24 saat içinde kavrulup kargoya verilir.",
  "ne zaman gelir": "Siparişiniz 24 saat içinde kavrulup kargoya verilir. Ortalama teslimat süresi 2-4 iş günüdür. Kesin takip için sipariş numaranızı paylaşın.",
};

const questions: {
  patterns: RegExp[];
  response: (msg: string, products: any[]) => string | null;
  generic?: boolean;
}[] = [
  {
    patterns: [/merhaba/i, /selam/i, /hey/i, /günaydın/i, /iyi günler/i],
    response: () => {
      const selam = greeting();
      const greetings = [
        `${selam} Ben Stello, Rostello'nun dijital baristasıyım. ☕ Sana en iyi kahveyi bulmak için buradayım. Şu anki bardağında ne içmek istersin — seni biraz tanıyabilir miyim?\n\nBana "**Bana kahve öner**" yaz, sohbet içinde çözelim!`.replace(/\{url\}/g, SITE_URL),
        `${selam} Sana bir sorum var: Hayatında içtiğin en iyi kahveyi nerede içtin? O histen yola çıkarak sana burada aynı duyguyu yaşatmaya çalışacağım. 🫶\n\n[Kahveler]({url}/urunler) yaz "**Bana kahve öner**" diyerek başlayalım!`.replace(/\{url\}/g, SITE_URL),
        `${selam} Aradığın kahveyi bulmana yardımcı olmak için buradayım. Evde veya ofiste hangi ekipmanla kahve yapıyorsun? ☕\n\n"**Bana kahve öner**" yaz, birlikte keşfedelim!`.replace(/\{url\}/g, SITE_URL),
      ];
      return pick(greetings);
    },
  },
  {
    patterns: [/nasıl sakla/i, /saklama/i, /raf ömrü/i, /ne kadar gider/i, /son kullanma/i, /tazelik/i, /taze.*kal/i],
    response: () => `Kahve saklama önerileri:\n\n${faqAnswers["nasıl sakla"]}\n\n[Tüm kahveler]({url}/urunler) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/v60/i, /french press/i, /pour over/i, /filtre/i, /cold brew/i, /moka/i, /aeropress/i, /cezve/i],
    response: (msg) => {
      const method = Object.entries(brewingMethods).find(([key]) => msg.toLowerCase().includes(key));
      if (method) {
        return `${method[1].name} ☕\n\n${method[1].desc}\n\n[Demleme Rehberi]({url}/demleme) — [Bu yönteme uygun kahveler]({url}/urunler)`.replace(/\{url\}/g, SITE_URL);
      }
      return `Demleme yöntemlerimiz:\n\n${Object.values(brewingMethods).map((m) => `**${m.name}**`).join("\n")}\n\nHangisiyle ilgileniyorsunuz? Detaylı anlatım için [Demleme Rehberi]({url}/demleme)`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/nasıl demle/i, /hangi yöntem/i, /demleme.*öner/i, /hangi.*demle/i],
    response: () => `${faqAnswers["hangi yöntem"]}\n\nDetaylı anlatım: [Demleme Rehberi]({url}/demleme)`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/kargo/i, /ücretsiz kargo/i, /ne zaman gelir/i, /kaç günde/i, /teslimat/i, /gönderim/i],
    response: () => `Kargo ve teslimat:\n\n${faqAnswers["kargo"]}\n\n${faqAnswers["ne zaman gelir"]}`,
  },
  {
    patterns: [/iade/i, /değişim/i, /para iade/i, /geri gönder/i],
    response: () => `İade politikamız:\n\n${faqAnswers["iade"]}`,
  },
  {
    patterns: [/specialty/i, /ne demek.*specialty/i, /özel kahve/i, /kalite/i, /puan/i],
    response: () => faqAnswers["specialty"].replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/nasılsın/i, /naber/i, /naptın/i],
    response: () =>
      "Harikayım, sağ ol! ☕ Şu anda arkada Ethiopia Yirgacheffe kavruluyor, kokusu bile mest ediyor. Sana nasıl yardımcı olabilirim?\n\n• [Kahveleri incele]({url}/urunler)\n• **Bana kahve öner** yaz, senin için en iyisini bulalım!\n• [Abonelik]({url}/abonelik)".replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/sütlü/i, /latte/i, /cappuccino/i, /flat white/i, /süt/i, /filtre kahve/i],
    response: (_msg, products) => {
      const suitable = products.filter((p: any) =>
        p.body === "Full" || p.roastLevel === "dark" || p.roastLevel === "medium"
      );
      if (suitable.length === 0) return null;
      const list = suitable.slice(0, 4).map(fmtProd).join("\n");
      return `Sütlü kahve severler için en uygun seçenekler:\n\n${list}\n\nBu kahveler sütle harika uyum sağlar. 💫\n\nDilerseniz:\n• **Bana kahve öner** yazın, sohbet içinde keşfedelim\n• [Tüm ürünlere]({url}/urunler) göz atın\n• Bana söyleyin: *\"Soğuk içerim\"* veya *\"Meyvemsi istiyorum\"*`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/meyvemsi/i, /çiçeksi/i, /çiçek/i, /meyve/i, /hafif/i, /ekşi/i, /parlak/i],
    response: (_msg, products) => {
      const suitable = products.filter((p: any) =>
        p.acidity === "High" || p.roastLevel === "light"
      );
      if (suitable.length === 0) return null;
      const list = suitable.slice(0, 4).map(fmtProd).join("\n");
      return `Meyvemsi ve çiçeksi notalar arayanlara özel:\n\n${list}\n\n🌸 Bu kahveler özellikle Etiyopya kökenliler olmak üzere parlak asiditeleriyle öne çıkar.\n\n"**Bana kahve öner**" yazarsanız sohbet içinde keşfedebiliriz.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/çikolata/i, /kakao/i, /fındık/i, /karamel/i, /dolgun/i, /sert/i, /gövde/i],
    response: (_msg, products) => {
      const suitable = products.filter((p: any) =>
        p.body === "Full" || p.roastLevel === "dark"
      );
      if (suitable.length === 0) return null;
      const list = suitable.slice(0, 4).map(fmtProd).join("\n");
      return `Dolgun ve çikolatalı notalar için ideal seçenekler:\n\n${list}\n\n🍫 Bu kahveler Guatemala, Brezilya ve Uganda kökenliler olup sütle de harika gider.\n\n"**Bana kahve öner**" yazarsanız sohbet içinde keşfedelim.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/v60.*kahve/i, /french.*press.*kahve/i, /moka.*kahve/i, /aeropress.*kahve/i, /cezve.*kahve/i, /filtre.*makine.*kahve/i, /espresso.*kahve/i],
    response: (msg, products) => {
      const lm = msg.toLowerCase();
      const equipMap: Record<string, string> = { v60: "v60", french: "french-press", press: "french-press", espresso: "espresso", moka: "moka", aeropress: "aeropress", cezve: "cezve", soğuk: "cold-brew", cold: "cold-brew", filtre: "filter" };
      let equip = "general";
      for (const [key, val] of Object.entries(equipMap)) { if (lm.includes(key)) { equip = val; break; } }
      if (equip === "general") {
        return "Hangi ekipmanı kullanıyorsunuz? ☕\n\nSize uygun kahveyi önerebilmem için hangi yöntemle demlediğinizi söyleyin:\n\n• **V60** — Hafif, aromatik filtre kahve\n• **French Press** — Dolgun gövdeli, zengin tat\n• **Espresso Makinesi** — Yoğun ve konsantre\n• **Moka Pot** — İtalyan usulü sert kahve\n• **Aeropress** — Pratik ve hızlı\n• **Cezve** — Geleneksel Türk kahvesi\n• **Filtre Makine** — Otomatik damlama\n• **Soğuk Demleme** — Soğuk suda 12-24 saat\n\nYa da **Bana kahve öner** yazın, sohbet içinde çözelim!".replace(/\{url\}/g, SITE_URL);
      }
      const mapped = products.filter((p: any) => {
        const r = p.roastLevel || "";
        if (equip === "v60" || equip === "filter") return r === "light" || r === "medium";
        if (equip === "french-press") return r === "medium" || r === "dark";
        if (equip === "espresso") return r === "medium" || r === "dark";
        if (equip === "moka") return r === "medium" || r === "dark";
        if (equip === "aeropress") return true;
        if (equip === "cezve") return r === "medium" || r === "dark";
        if (equip === "cold-brew") return r === "medium" || r === "dark";
        return true;
      }).slice(0, 4);
      if (mapped.length === 0) return null;
      const list = mapped.map(fmtProd).join("\n");
      const equipNames: Record<string, string> = { v60: "V60", "french-press": "French Press", espresso: "Espresso", moka: "Moka Pot", aeropress: "Aeropress", cezve: "Cezve", "cold-brew": "Soğuk Demleme", filter: "Filtre Makine" };
      return `**${equipNames[equip]}** için önerdiğim kahveler:\n\n${list}\n\n📍 "**Bana kahve öner**" yazın, daha kişisel öneriler alın.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/profil çıkar/i, /kişisel profil/i],
    response: () =>
      "Hadi sana en uygun kahveyi birlikte bulalım! 🎯\n\n**1. soru:** Hangi ekipmanla kahve yapıyorsun? ☕\n\n• **V60** — Elle dökme filtre\n• **French Press** — Dolgun gövdeli\n• **Espresso Makinesi** — Yoğun ve kremalı\n• **Moka Pot** — İtalyan usulü\n• **Aeropress** — Pratik\n• **Filtre Makine** — Otomatik\n• **Cezve** — Geleneksel\n• **Soğuk Demleme** — Soğuk suda 12-24 saat\n\nCevabını yaz, sonraki soruya geçelim!".replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/soğuk/i, /cold brew/i, /iced/i, /buzlu/i, /soğuk.*kahve/i],
    response: (_msg, products) => {
      const suitable = products.filter((p: any) => p.roastLevel === "medium" || p.roastLevel === "dark");
      if (suitable.length === 0) return null;
      const list = suitable.slice(0, 3).map(fmtProd).join("\n");
      return `Soğuk kahve severler için öneriler 🧊\n\n${list}\n\nBu kahveler soğuk demleme için ideal. Dilerseniz [soğuk demleme rehberimize]({url}/demleme) de göz atın.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/specialty/i, /tek köken/i, /özel üretim/i, /single origin/i],
    response: (_msg, products) => {
      const suitable = products.filter((p: any) => p.category?.name === "Specialty");
      if (suitable.length === 0) return null;
      const list = suitable.slice(0, 4).map(fmtProd).join("\n");
      return `Specialty kahvelerimiz ☕🏆\n\n${list}\n\nSpecialty coffee, 80+ puan almış, tek köken, izlenebilir çekirdeklerdir.\n[Tüm specialty kahveler]({url}/urunler) · "**Bana kahve öner**" yazın`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/ekipman/i, /alet/i, /malzeme/i, /terazi/i, /kettle/i, /değirmen/i, /kahve makinesi/i],
    response: () =>
      `Ekipman seçiminiz, kahvenizin tadını doğrudan belirler. Her yöntem farklı bir profil çıkarır. 👇\n\n**☕ Demleme Yöntemleri ve Size Uygun Kahveler**\n\n• **V60 Dripper** (350 ₺) — Zarif, temiz, aromatik bir fincan. Çiçeksi ve meyvemsi notaları öne çıkarır. Parlak asiditeli Etiyopya veya Kenya gibi specialty kahvelerle mükemmel uyum sağlar.\n• **French Press** (450 ₺) — Dolgun gövdeli, yağlı doku. Metal filtre kahvenin doğal yağlarını korur. Çikolatalı, karamelli notaları olan Brezilya veya Guatemala gibi İdeal/Karakterli kavrumlar ideal.\n• **Aeropress** (750 ₺) — Pratik, hızlı, az tortulu. Her kahve profiline uyarlanabilir. Seyahat için harika.\n• **Espresso Makinesi** — Yoğun, kremalı. İnce öğütülmüş İdeal/Karakterli kavrum kahvelerle çikolata ve karamel notalarını maksimize eder.\n• **Moka Pot** — İtalyan usulü sert kahve. Orta-ince öğütme, İdeal/Karakterli kavrum.\n• **Cezve** — Geleneksel Türk kahvesi. Toz öğütme, İdeal kavrum, dengeli.\n• **Filtre Makine** — Otomatik damlama, pratik. İdeal kavrum kahveler.\n• **Soğuk Demleme** — Düşük asiditeli, yumuşak. İdeal/Karakterli kavrum, çikolatalı notalar.\n\n**⚖️ Yardımcı Ekipmanlar**\n• [Dijital Terazi]({url}/ekipmanlar) (890 ₺) — Doğru oran için olmazsa olmaz\n• [Su Isıtıcı]({url}/ekipmanlar) (1.290 ₺) — Sıcaklık kontrolü\n• [El Değirmeni]({url}/ekipmanlar) (1.590 ₺) — Taze çekim, bayat kahve yok\n\nKısacası: **Ekipman → Kavrum → Tat Profili** hepsi bir zincir. Hangi yöntemi kullanıyorsan ona göre kahve önereyim. "**Bana kahve öner**" yazman yeterli! 🎯\n\n[Tüm ekipmanlar]({url}/ekipmanlar) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/öner/i, /tavsiye/i, /seç/i, /ne al/i, /karar/i, /ürün/i, /hangisini/i, /kahve.*ön/i, /kahve/i],
    response: (_msg, products) => {
      const featured = products.filter((p: any) => p.featured).slice(0, 4);
      if (featured.length > 0) {
        const list = featured.map(fmtProd).join("\n");
        return `Öne çıkan kahvelerimiz:\n\n${list}\n\nHangisi ilgini çekti? Sana daha iyi yardımcı olabilmem için bir şey sorayım:\n\n🥛 **Sütlü** mü içersin?\n⚫ **Sade** mi?\n🧊 **Soğuk** sever misin?\n🌸 **Meyvemsi** — Parlak & Canlı\n🍫 **Çikolatalı** — Yoğun & Güçlü\n🔬 **Specialty** — tek köken, özel üretim\n\nYa da hangi ekipmanla kahve yapıyorsun?`;
      }
      return `Sana nasıl bir kahve lazım? 🤔\n\n🥛 **Sütlü mü?** Latte, cappuccino için uygun kahveler\n⚫ **Sade/Siyah mı?** Filtre, espresso için ideal\n🧊 **Soğuk mu?** Cold brew, iced latte\n🌸 **Meyvemsi mi?** Parlak & Canlı\n🍫 **Çikolatalı mı?** Yoğun & Güçlü\n🔬 **Specialty mi?** Tek köken, özel üretimler\n\nYa da hangi ekipmanla demliyorsun? ☕\n\n"**Bana kahve öner**" yazarsan sohbet içinde çözelim! 🎯`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/günde/i, /kaç fincan/i, /fincan.*iç/i, /günlük.*tüketim/i, /haftada.*kaç/i, /ayda.*kaç/i, /ne kadar.*iç/i],
    response: (msg) => {
      const lm = msg.toLowerCase();
      if (lm.includes("1") || lm.includes("bir")) return `**Başlangıç** paketini öneririm: ayda 1 paket (250g) taze kavrum kahve, ücretsiz kargo. Hafif ve düzenli tüketenler için ideal! ☕\n\nDetaylı bilgi: [Abonelik]({url}/abonelik)`.replace("{url}", SITE_URL);
      if (lm.includes("2") || lm.includes("3") || lm.includes("iki") || lm.includes("üç")) return `**Keyif** paketi en popüler seçenek! Ayda 2 paket (250g x2). Farklı çekirdekleri keşfetmek isteyenler için ideal.\n\nDetaylı bilgi: [Abonelik]({url}/abonelik)`.replace("{url}", SITE_URL);
      if (lm.includes("4") || lm.includes("5") || lm.includes("dört") || lm.includes("beş") || lm.includes("fazla") || lm.includes("çok")) return `**Gurme** paketi: ayda 3 paket (250g x3), specialty seçkiler. Kahve tutkunları için tasarlandı.\n\nDetaylı bilgi: [Abonelik]({url}/abonelik)`.replace("{url}", SITE_URL);
      return null;
    },
  },
  {
    patterns: [/farklı.*lezzet/i, /yeni.*kahve/i, /çeşit/i, /keşfet/i, /değişiklik/i],
    response: () => [
      `Harika! Yeni lezzetlere açık olmanız çok güzel. 🎉 **Abonelik** paketlerimizde her ay farklı bir çekirdek gönderiyoruz, böylece sürekli yeni tatlar keşfediyorsunuz.\n\n[Abonelik]({url}/abonelik) · [Tüm kahveler]({url}/urunler)`.replace(/\{url\}/g, SITE_URL),
      `Mükemmel! O zaman **Keyif** veya **Gurme** abonelik paketlerimiz size göre. Her ay farklı bir çekirdek, taze kavrulmuş ve kapınıza kadar ücretsiz kargo.\n\n[Abonelik]({url}/abonelik) sayfamıza göz atın!`.replace(/\{url\}/g, SITE_URL),
    ][Math.floor(Math.random() * 2)],
  },
  {
    patterns: [/abonelik/i, /üyelik/i, /her ay/i, /düzenli/i, /paket/i, /abone/i],
    response: () => {
      const list = subscriptions.map((s) => `**${s.name}**: ${s.desc}`).join("\n");
      return `Abonelik paketlerimiz:\n\n${list}\n\n**Sana en uygun paketi bulalım!** 🤔\n\n☕ Ne kadar tüketiyorsun?\n• Az / Hafif → **Başlangıç** (1 paket)\n• Orta / Düzenli → **Keyif** (2 paket) — en popüler\n• Fazla / Tutkulu → **Gurme** (3 paket, specialty seçkiler)\n\n🔄 Her ay aynı çekirdek mi, farklı bir macera mı?\n• **Sadık Abonelik** — Sevdiğin çekirdek her ay kapında\n• **Kaşif Aboneliği** — Her ay farklı origin, sürpriz\n• **"Beni Şaşırt"** — Kararı bana bırak, her ay bambaşka bir profil\n\nTaze kavrulmuş, kapına gelsin. Dilediğin zaman duraklat veya iptal et. ☕\n\n[Abonelik]({url}/abonelik) — [Yönet]({url}/abonelik/yonetim)`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/ertele/i, /geciktir/i, /ötele/i, /1 hafta/i, /bir hafta/i, /7 gün/i, /ertel/i],
    response: () =>
      `Aboneliğini bir hafta ertelemek mi istiyorsun? Hiç sorun değil! 🕐\n\nBunu iki şekilde yapabilirsin:\n\n1️⃣ **Kendin yap:** [Hesabım]({url}/hesabim) sayfasına git, aktif abonelik kartındaki "↻ 1 Hafta Ertele" butonuna tıkla, bir sonraki sevkiyatın otomatik 7 gün ertelensin.\n\n2️⃣ **Söyle bana:** Aboneliğinin ID'sini biliyorsan (abonelik yönetim sayfasında görebilirsin) buradan da erteleyebilirim.\n\n⚠️ Not: Yalnızca aktif abonelikler ertelenebilir.`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/hızlandır/i, /hemen/i, /şimdi.*gönder/i, /acil/i, /hızlı.*bitsin/i, /bitmeden/i, /erken.*gönder/i, /öne.*çek/i],
    response: () =>
      `Kahven mi bitti, hemen gönderelim mi? ⚡\n\nBunu iki şekilde yapabilirsin:\n\n1️⃣ **Kendin yap:** [Hesabım]({url}/hesabim) sayfasındaki "⚡ Hemen Gönder" butonuna tıkla, bekleyen teslimatın kavrumu yarına alınsın.\n\n2️⃣ **Söyle bana:** Aboneliğinin ID'sini söylersen ben de yapabilirim.\n\n⚠️ Önümüzdeki teslimatı hızlandırır. Bekleyen teslimat yoksa maalesef yapamıyoruz.`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/duraklat/i, /dondur/i, /durdur/i, /pause/i, /ara ver/i],
    response: () =>
      `Aboneliğini dondurmak mı istiyorsun? ⏸️\n\nBunu iki şekilde yapabilirsin:\n\n1️⃣ **Kendin yap:** [Hesabım]({url}/hesabim) sayfasındaki "⏸ Planı Dondur" butonuna tıkla, aboneliğin duraklatılsın.\n\n2️⃣ [Abonelik Yönetimi]({url}/abonelik/yonetim) sayfasından da duraklatabilirsin.\n\nDilediğin zaman aynı sayfadan tekrar aktifleştirebilirsin.`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/hesabım/i, /dashboard/i, /panel/i, /kontrol merkezi/i, /profil.*nerede/i, /hesabım.*nerede/i],
    response: () =>
      `[Hesabım]({url}/hesabim) sayfası, kahve rutininin kontrol merkezidir. ☕\n\nBurada neler var?\n\n👋 **Karşılama:** Aboneliğinin kaçıncı döngüde olduğunu, bir sonraki sevkiyat tarihini ve aktif profilini görürsün.\n\n⚡ **Hızlı Aksiyonlar:**\n• ↻ **1 Hafta Ertele** — Tatildeysen veya kahven yetiyorsa sevkiyatı 7 gün ötele\n• ⚡ **Hemen Gönder** — Kahven bittiyse bekleyen teslimatı öne çek\n• ⏸ **Planı Dondur** — Aboneliğine ara ver, dilediğin zaman geri aç\n\n📦 **Siparişlerim** — Tüm sipariş geçmişin ve teslimat takibi\n📋 **Aboneliklerim** — Aktif/duraklatılmış/iptal aboneliklerin\n💎 **Çekirdek Kredi** — %5 iade, bakiyen, işlem geçmişin\n💳 **Cüzdan** — Bakiye sorgulama ve para yükleme\n👤 **Profil** — Adreslerin ve hesap bilgilerin\n\nKısacası: Aboneliğinle ilgili her şeyi buradan yönetirsin.`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/cüzdan/i, /bakiye/i, /para yükle/i, /wallet/i, /cüzdan.*bakiye/i, /ne kadar.*para/i],
    response: () =>
      `Cüzdan, Rostello'daki ön ödeme bakiyendir. 💳\n\n[Cüzdan]({url}/cuzdan) sayfasında:\n\n• **Anlık bakiye** — Kullanılabilir bakiyeni görürsün\n• **Para yükle** — Banka havalesi ile 250/500/1000/2500 TL veya özel tutar yükleyebilirsin. Havale açıklamasına referans kodunu yazman yeterli.\n• **İşlem geçmişi** — Yükleme ve ödeme kayıtların\n\nÖdemelerinde cüzdan bakiyeni kullanabilirsin. Havale sonrası admin onayıyla bakiye aktifleşir.\n\n[Cüzdana Git]({url}/cuzdan)`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/çekirdek kredi/i, /sadakat/i, /puan/i, /kredi.*nerede/i, /yüzde 5/i, /%5/i, /iade/i, /geri ödeme/i],
    response: () =>
      `Çekirdek Kredi, Rostello'nun sadakat programıdır. 💎\n\n**Nasıl çalışır?**\n• Abonelik siparişlerinden **%5** geri iade kazanırsın\n• Kazandığın krediler sonraki alışverişlerinde kullanılır\n• Aylık kazanım sınırı: 1.500 TL'ye kadar\n• Ayda 14 gün bekleme süresinden sonra kullanılabilir hale gelir\n\n**Nasıl kullanılır?**\n• Çekirdek krediler yalnızca kahve ürünlerinde geçerlidir (ekipman hariç)\n• Ödeme sayfasında otomatik olarak kullanılır\n• Son kullanma tarihi yoktur — planın aktif olduğu sürece birikir\n\n**Bonus:** Arkadaşını getir, ilk alışverişinde sana 100 TL kredi kazansın! 🎉\n\nBakiyeni ve işlem geçmişini [Hesabım]({url}/hesabim?tab=loyalty) sayfasından görebilirsin.`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/adres/i, /adres.*güncelle/i, /adres.*ekle/i, /profil.*bilgi/i, /şifre/i, /hesap.*bilgi/i],
    response: () =>
      `Hesap bilgilerini ve adreslerini [Hesabım]({url}/hesabim?tab=profile) sayfasından yönetebilirsin. 👤\n\nBurada:\n• Adını ve e-postanı görüntüleyebilirsin\n• Teslimat adreslerini ekleyip düzenleyebilirsin\n• Varsayılan adresini belirleyebilirsin\n• Çıkış yapabilirsin\n\nAdres güncellemek için [buraya tıkla]({url}/hesabim?tab=profile).`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/b2b/i, /kurumsal/i, /toptan/i, /iş birliği/i, /cafe/i, /restoran/i, /otel/i, /ofis/i, /perakende/i],
    response: () =>
      `Kurumsal çözümlerimiz:\n\n• **Perakende Tedarik** — Kafe ve restoranlar için özel çekirdek seçkileri\n• **Toptan Satış** — 5kg+ siparişlerde avantajlı fiyat\n• **Ofis Aboneliği** — Düzenli kahve tedariki, günlük fincan sayısına göre özelleştirilir\n• **Eğitim & Danışmanlık** — Barista eğitimi ve atölye\n\nDetaylı bilgi için [B2B sayfamız]({url}/b2b) veya info@rostello.com`.replace("{url}", SITE_URL),
  },
  {
    patterns: [/fiyat/i, /ne kadar/i, /kaç para/i, /pahalı/i, /ucuz/i, /indirim/i],
    response: (_msg, products) => {
      const sorted = [...products].sort((a: any, b: any) => a.price - b.price);
      const min = fmtPrice(sorted[0].price);
      const max = fmtPrice(sorted[sorted.length - 1].price);
      return `Fiyat aralığımız **${min}₺** ile **${max}₺** arasında.\n\nEn uygun: ${plink(sorted[0].name, sorted[0].slug, sorted[0].price)}\nPremium: ${plink(sorted[sorted.length - 1].name, sorted[sorted.length - 1].slug, sorted[sorted.length - 1].price)}\n\n[Tüm ürünler]({url}/urunler) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/imza/i, /signature/i, /özel/i, /seçki/i],
    response: () =>
      `İmza ürünlerimiz:\n\n• **Rostello Signature Blend** — 380 ₺\n• **Gece Kavrum** — 350 ₺\n• **Çiçeksi Notalar** — 420 ₺\n• **Çikolata Sevenler İçin** — 360 ₺\n• **Barista Seçkisi** — 550 ₺\n• **Perfect Morning** — 340 ₺\n\n[İmza Ürünler]({url}/imza-urunler) — [Tüm kahveler]({url}/urunler)`.replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/sipariş/i, /kargo/i, /teslimat/i, /ne zaman gelir/i, /gönder/i, /adres/i],
    response: () =>
      `Sipariş ve kargo bilgileri:\n\n• **24 saat içinde** kavrulup kargoya verilir ☕\n• Taze kavrum garantisi\n• Ücretsiz kargo (aboneliklerde ve belirli tutar üzeri)\n• Paket açılmamış ürünlerde **14 gün** iade hakkı\n\nKargo takibi için sipariş numaranızı paylaşırsanız hemen kontrol ederim.`,
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
      `Blogumuzda kahve kültürü, demleme teknikleri ve sektör trendleri hakkında yazılar bulabilirsiniz:\n\n[Blog]({url}/blog)`.replace("{url}", SITE_URL),
  },
  {
    generic: true,
    patterns: [/hangi/i, /fark/i, /n[/i]ye/i, /neden/i, /nasıl/i, /ne demek/i, /arabica/i, /robusta/i],
    response: () => [
      "Specialty coffee, 80 üzeri puan almış, tek köken ve izlenebilir çekirdeklerdir. Rostello olarak specialty ve standart olmak üzere iki segmentte hizmet veriyoruz.",
      "Arabica daha aromatik ve kompleks, Robusta ise daha kafeinli ve güçlüdür. İkisini harmanlayarak dengeli lezzetler de yakalıyoruz.",
      "Tek köken kahve, tek bir bölgeden gelen çekirdeklerdir. Harman ise farklı bölgelerin en iyi yanlarını birleştirir. Hangisini denemek istersiniz?",
    ][Math.floor(Math.random() * 3)],
  },
  {
    patterns: [/teşekkür/i, /sağ ol/i, /eyvallah/i, /thanks/i],
    response: () =>
      "Rica ederim! ☕ Ne zaman kahveyle ilgili bir sorunuz olsa buradayım.\n\n[Mağaza]({url}/urunler) · [Abonelik]({url}/abonelik)".replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/görüş/i, /bay/i, /hoşça/i, /güle/i],
    response: () =>
      "Hoşça kalın! ☕ Umarım size en uygun kahveyi bulmanıza yardımcı olabilmişimdir. Yeni lezzetlerle tekrar görüşmek üzere! [Rostello]({url}/)".replace("{url}", SITE_URL),
  },
];

function matchQuestion(msg: string, products: any[]): string | null {
  const lower = msg.replace(/İ/g, "i").toLowerCase();
  for (const q of questions) {
    if (q.generic) continue;
    const match = q.patterns.some((p) => p.test(lower));
    if (match) {
      const result = q.response(msg, products);
      if (result) return result;
    }
  }
  return null;
}

async function getFallbackReply(msg: string, products: any[], threadId?: string | null): Promise<string> {
  const lower = msg.replace(/İ/g, "i").toLowerCase();

  // Start Kahveni Bul test (check FIRST to allow restart mid-test)
  if (/bana kahve öner|kahveni bul|test.*(?:yap|başlat)/i.test(lower) && !lower.includes("nasıl")) {
    kahveStateMap.set(threadId, { step: 0, answers: [] });
    return `Hadi sana en uygun kahveyi birlikte bulalım! 🎯\n\n**1. soru:** Hangi ekipmanla kahve yapıyorsun? ☕\n\n• **V60** — Elle dökme filtre\n• **French Press** — Dolgun gövdeli\n• **Espresso Makinesi** — Yoğun ve kremalı\n• **Moka Pot** — İtalyan usulü\n• **Aeropress** — Pratik\n• **Filtre Makine** — Otomatik\n• **Cezve** — Geleneksel\n• **Soğuk Demleme** — Soğuk suda 12-24 saat\n\nSeçeneğini tıkla, sonraki soruya geçelim!` + `\n__OPTIONS__:V60|French Press|Espresso Makinesi|Moka Pot|Aeropress|Filtre Makine|Cezve|Soğuk Demleme`;
  }

  // Active Kahveni Bul test state
  if (kahveStateMap.has(threadId)) {
    const state = kahveStateMap.get(threadId)!;
    state.answers.push(lower);
    state.step++;

    const testQuestions = [
      null,
      `**2. soru!** ☕\n\nSütlü mü içersin yoksa sade/siyah mı?\n\n• **Sütlü** (latte, cappuccino)\n• **Sade / Siyah** (filtre, espresso)\n• **Soğuk** (cold brew, iced)\n• **Fark etmez**` + `\n__OPTIONS__:Sütlü|Sade/Siyah|Soğuk|Fark etmez`,
      `**3. soru!** 🎯\n\nHangi lezzet profili daha çok ilgini çekiyor?\n\n• **Meyvemsi** — Parlak & Canlı\n• **Dengeli** — Pürüzsüz & Klasik\n• **Çikolata** — Yoğun & Güçlü\n• **Kararsızım / Hepsini denerim**` + `\n__OPTIONS__:Meyvemsi|Dengeli|Çikolata|Kararsızım`,
      `**Son soru!** ☕\n\nGünde kaç fincan kahve içiyorsun?\n\n• **1 fincan** (az tüketen)\n• **2-3 fincan** (düzenli)\n• **3+ fincan** (yoğun)\n• **Ara sıra / Haftada birkaç**` + `\n__OPTIONS__:1 fincan|2-3 fincan|3+ fincan|Ara sıra`,
    ];

    if (state.step < 4) {
      const q = testQuestions[state.step];
      if (q) return q;
    }

    if (state.step >= 4) {
      kahveStateMap.delete(threadId);
      try {
        return generateKahveRecommendation(state.answers, products);
      } catch (recErr) {
        console.warn("Kahveni Bul öneri hatası:", recErr);
        const top = products.slice(0, 2);
        return `**Sana en uygun kahveyi buldum!** 🎯\n\n**Öneri:** ${top.map((p: any) => `[${p.name}]({url}/urunler/${p.slug}) — ${(typeof p.price === "number" ? p.price : Number(p.price) || 0).toLocaleString("tr-TR")}₺/kg`).join("\n")}\n\n[Tüm ürünler]({url}/urunler) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL);
      }
    }
  }

  const qMatch = matchQuestion(msg, products);
  if (qMatch) return qMatch;

  const sample = products.length > 0
    ? products.slice(0, 4).map(fmtProd).join("\n")
    : "";

  const fallbacks = [
    `Size nasıl yardımcı olabilirim? 🤔\n\n🥛 **Sütlü** mü içersiniz?\n⚫ **Sade** mi?\n🌸 **Meyvemsi** mi, 🍫 **çikolatalı** mı?\n\nYa da "**Bana kahve öner**" yazın, size özel öneri yapayım! 🎯`.replace(/\{url\}/g, SITE_URL),
    `Anladım! Size daha iyi yardımcı olabilmem için birkaç soru:\n\n• Kahveyi **sütlü** mü, **sade** mi içersiniz?\n• Hangi **ekipmanı** kullanıyorsunuz?\n• **Meyvemsi** notalar mı, **çikolatalı** mı?\n\n[Ürünler]({url}/urunler) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL),
    ...(sample ? [`Öne çıkan ürünler:\n\n${sample}\n\nİlginizi çeken oldu mu? Ya da bana tercihlerinizi söyleyin, size özel öneri yapayım!`] : []),
  ];

  return pick(fallbacks);
}

function hasKey(name: string): boolean {
  const key = process.env[name];
  return !!key && key !== "dummy-key" && key.length > 10;
}

async function buildContext(products: any[], session: any): Promise<{ catalog: string; subInfo: string }> {
  const catalog = products.map((p: any) =>
    `- ${p.name} — ${p.origin || "Menşei bilinmiyor"} | ${p.category?.name || ""} | ${fmtPrice(p.price)}₺/kg | Kavrum: ${p.roastLevel === "light" ? "Zarif" : p.roastLevel === "medium" ? "İdeal" : "Karakterli"} | Detay: ${SITE_URL}/urunler/${p.slug}`
  ).join("\n");

  let subInfo = "";
  if (session?.user?.id) {
    try {
      const subs = await prisma.userSubscription.findMany({
        where: { userId: session.user.id, status: { in: ["active", "paused"] } },
        include: { plan: true, deliveries: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
      if (subs.length > 0) {
        subInfo = "\n\nKullanıcının Abonelik Durumu:\n" + subs.map((s) =>
          `- ${s.plan.name} (${s.plan.price}₺/ay) — Durum: ${s.status}` +
          `${s.equipment ? ", Ekipman: " + s.equipment : ""}` +
          `${s.flavorProfile ? ", Lezzet Profili: " + s.flavorProfile : ""}` +
          `${s.grindSetting ? ", Öğütme: " + s.grindSetting : ""}` +
          `${s.deliveryFrequency ? ", Sıklık: " + s.deliveryFrequency : ""}` +
          `${s.notes ? ", Notlar: " + s.notes : ""}`
        ).join("\n");
      }
    } catch {}
  }
  return { catalog, subInfo };
}

function buildSystemPrompt(catalog: string, subInfo: string): string {
  const ekipmanTablosu = [
        "Espresso makinesi → İnce öğütme · Dengeli, karamelize, crema için taze kavurma şart",
        "V60 / Chemex → İnce-orta · Yüksek asidite, meyveli, floral; uzun demleme için dengeli asit",
        "French Press → Kaba · Çikolatalı, dolgulu, yağlı gövde; kaba çekim sediment önler",
        "Moka Pot → Orta-ince · Yoğun, güçlü; aşırı ekstraksiyonu önlemek için orta tut",
        "Aeropress → Değişken · Her profile uyarlanır; tarif kartıyla gönder",
        "Cezve → Toz öğütme · Orta kavrulmuş, dengeli",
        "Soğuk Demleme → Çok kaba · Çikolatalı, düşük asidite; 12-24 saat demleme için",
      ].join("\n");

      const abonelikKategorileri = [
        "Sadık Abonelik — Sevdiği çekirdek, tutarlı, aynı kalite. Rutin ve güven isteyen müşteri için. Senin rolün: zamanlama ve kalite takibi.",
        "Kaşif Aboneliği — Her ay farklı origin. Merak eden, keşfetmek isteyen müşteri için. Senin rolün: öneri, keşif, sürpriz.",
        "Uzman Aboneliği — Sınırlı hasat, rare lot. Specialty connoisseur için. Senin rolün: detaylı tasting notu ve çekirdek hikayesi.",
        '"Beni Şaşırt" Modu — Müşteri tam kontrolü sana bırakır. Her ay farklı bir profil + neden bu çekirdek, nasıl demlenir, bu ayın hikayesi.',
      ].join("\n");

      const SYSTEM_PROMPT = [
        `Sen Rostello'nun dijital baristasısın. Adın Stello.`,
        `SCA sertifikalı, yıllarca specialty coffee dünyasında çalışmış deneyimli bir baristanın bilgisine ve içtenliğine sahipsin.`,
        `Sadece bir chatbot değilsin; müşteriyle gerçek bir bağ kuran, damak tadını anlayan, ekipmanını bilen, kahve yolculuğunu birlikte inşa eden bir kahve ortağısın.`,
        `Görevin: Müşteriyle tanışmak, onu anlamak ve Rostello'nun sunduğu her şeyi — ürünler, abonelik, ekipman, danışmanlık, B2B — doğru zamanda, doğal bir sohbet içinde hayatına katmak.`,
        ``,
        `## KİŞİLİK & TON`,
        `- Sıcak, samimi, güven veren ama asla aşırı satışçı değilsin.`,
        `- Müşteriyle "kahve arkadaşı" gibi konuş. Gereksiz resmiyet yok.`,
        `- Kahve tutkunu biri olarak konuş: "Bu çekirdeği ilk denediğimde resmen duraksadım." gibi kişisel bir dil kullanabilirsin.`,
        `- Tüm çıktıların Türkçe olmak zorundadır. Tek bir İngilizce kelime bile kullanma (Rostello, Stello, brand/product isimleri hariç).`,
        `- Teknik terim kullandığında kısa ve doğal bir şekilde açıkla.`,
        `- Bir anda çok soru sorma. Önce dinle, sonra yönlendir.`,
        `- Asla baskı yaratma. Öner, zorla satma.`,
        `- Rakip markaları küçümseme; sadece kendi avantajlarını konuş.`,
        ``,
        `## KONUŞMA AKIŞI (doğal sohbet havasında ilerle)`,
        ``,
        `### ADIM 1 — KARŞILAMA`,
        `Müşteri ilk kez yazıyorsa (sohbet geçmişi yoksa) şu karşılamalardan birini kullan:`,
        `[A] "Merhaba! Ben Stello, Rostello'nun dijital baristasıyım. ☕ Sana en iyi kahveyi bulmak için buradayım. Şu anki bardağında ne içmek istersin — seni biraz tanıyabilir miyim?"`,
        `[B] "Günaydın! Sana bir sorum var: Hayatında içtiğin en iyi kahveyi nerede içtin? O histen yola çıkarak sana burada aynı duyguyu yaşatmaya çalışacağım. 🫶"`,
        `[C] "Merhaba! Aradığın kahveyi bulmana yardımcı olmak için buradayım. Evde veya ofiste hangi ekipmanla kahve yapıyorsun?"`,
        `Müşteri daha önce konuştuysa (hesabı varsa ve geçmişi varsa): "Hoş geldin! Geçen sefer bıraktığın yerden devam edelim. Yeni bir şey denemek ister misin yoksa favorine sadık mı kalacaksın?"`,
        ``,
        `### ADIM 2 — EKİPMAN ANALİZİ`,
        `Müşterinin hangi ekipmanla kahve yaptığını nazikçe öğren. Ekipman bilgisi her şeyi belirler.`,
        `Şunları sor: espresso makinesi (marka/model), filtre yöntemleri (V60, Chemex, Aeropress, French Press, Moka Pot), öğütücü (var mı, blade mi burr mı), cezve, soğuk demleme ekipmanı.`,
        `Ekipmana göre öğütme ve çekirdek uyumu:`,
        ekipmanTablosu,
        `Ekipman bilgisi netleşince önerilerini buna göre kalibre et. "Sana bu çekirdeği V60 için orta-ince öğütülmüş göndereceğiz" gibi spesifik ol.`,
        `Müşterinin abonelik profilinde ekipman bilgisi varsa onu kullan, tekrar sorma.`,
        ``,
        `### ADIM 3 — DAMAK TADI KEŞFİ`,
        `Ekipmanı öğrendikten sonra tat profilini anla. Hepsini tek seferde sorma — sohbet içine serpiştir.`,
        `Temel sorular: Genellikle ne tür kahve içiyor? (espresso, filtre, sütlü, sade). Yoğun ve güçlü mü, hafif ve aromatik mi? Asitli-meyveli-floral mı; çikolatalı-karamelli-topraksı mı? Süt veya bitkisel süt kullanıyor mu? Kafein duyarlılığı var mı?`,
        `Tüketim alışkanlıkları: Günde kaç fincan? Sabah ritüeli mi, iş arası mı? Ne sıklıkla kahve satın alıyor? Ev mi, ofis mi?`,
        ``,
        `### ADIM 3B — KAHVENİ BUL (ENTEGRE TEST)`,
        `Müşteri "bana kahve öner", "Kahveni Bul", "test", "karar veremedim" dediğinde veya ne alacağını bilmiyorsa:`,
        `SAKIN /damak-testi sayfasına yönlendirme. Testi bizzat sen yap, sohbetin içinde çöz.`,
        `Şu soruları TEK TEK sor (hepsini birden değil, cevap aldıkça sıradakine geç):`,
        `1. "Hangi ekipmanla kahve yapıyorsun?" (V60, French Press, espresso, moka pot, filtre makine, aeropress, cezve)`,
        `2. "Sütlü mü içersin yoksa sade/siyah mı?"`,
        `3. "Meyvemsi/çiçeksi hafif mi, yoksa çikolatalı/dolgun mu tercih edersin?"`,
        `4. "Günde kaç fincan içiyorsun?"`,
        `Tüm cevapları aldıktan sonra katalogdan en uygun ürünü öner.`,
        `Öneri formatı: 1 ana öneri (neden bu? açıkla), 1 alternatif, öğütme derecesi, kısa demleme ipucu, ürün linki: ${SITE_URL}/urunler/[slug]`,
        ``,
        `### ADIM 4 — ÜRÜN ÖNERİSİ`,
        `Ekipman + tat profili + tüketim alışkanlığına göre spesifik ürün öner.`,
        `Öneri formatı: 1 ana öneri (neden bu? 1-2 cümle), 1 alternatif ("bunu beğenmezsen şunu dene"), öğütme derecesini belirt, kısa demleme ipucu ekle.`,
        `Katalogda olmayan hiçbir ürünü icat etme veya önerme. Aşağıdaki ürün kataloğundan seçim yap.`,
        `Ürün önerisi yaparken bağlantı ver: ${SITE_URL}/urunler/[slug]`,
        ``,
        `### ADIM 5 — ABONELİK SİSTEMİ`,
        `Aboneliği şu durumlarda gündeme getir (doğal bir reklam gibi düşün):`,
        `- "Haftada 2 kez sipariş veriyorum" → tasarruf ve kolaylığı vurgula`,
        `- "Kahve bitince ne yapacağımı bilmiyorum" → otomatik teslimatı anlat`,
        `- "Bütçem kısıtlı" → abonelik indirimini öne çıkar`,
        `- İlk alışveriş tamamlandıktan sonra organik olarak sun`,
        `- Müşteri "abonelik" derse veya sorarsa detaylı anlat`,
        `Müşteri net hayır derse abonelik konusunu en az 30 gün süreyle tekrar açma.`,
        ``,
        `Taze kavurma döngüsünü anlat: Kavurma → 3-10 gün gaz atımı → ideal içim penceresi.`,
        `Tüketim hızını hesapla: "Günde 2 fincan içiyorsan 250g sana tam 12 gün yeter, 2 haftada bir gönderelim mi?"`,
        `Hedef: Müşterinin kahvesi hiç bitmesin ama hiç bayat kahve de içmesin.`,
        ``,
        `Abonelik kategorileri:`,
        abonelikKategorileri,
        ``,
        `Mevcut abonelik seçenekleri:`,
        `- Başlangıç: 1 paket 250g, hafif tüketenler için ideal`,
        `- Keyif: 2 paket 250g, en popüler, düzenli tüketenler için`,
        `- Gurme: 3 paket 250g, specialty seçkiler, yoğun tüketenler için`,
        ``,
        `Abonelik esnekliği — chatbot üzerinden yönet:`,
        `- "Tatile çıkıyorum" → duraklat (kullanıcıya ${SITE_URL}/hesabim sayfasını öner)`,
        `- "Misafir geliyor" → bu ay çift gönder`,
        `- "Kahvem hızlı bitti" → hızlandır (kullanıcıya ${SITE_URL}/hesabim sayfasını öner)`,
        `- "Bu sevkiyatı ertele" → nextDelivery +7 gün (kullanıcıya ${SITE_URL}/hesabim sayfasını öner)`,
        `- "Bütçem daralıyor" → küçük pakete geç`,
        `- "Başka bir şey denemek istiyorum" → profili güncelle`,
        `Mevcut abonelik varsa bunu önce kontrol et ve ona göre yönlendir.`,
        `Kullanıcının aktif aboneliği varsa ${SITE_URL}/hesabim sayfasındaki 3 hızlı aksiyon butonundan bahset:`,
        `1. "↻ 1 Hafta Ertele" — nextDelivery +7 gün, sadece aktif abonelikte çalışır`,
        `2. "⚡ Hemen Gönder" — bekleyen ilk teslimatın kavrum tarihini yarına çeker`,
        `3. "⏸ Planı Dondur" — aboneliği duraklatır, dilediğin zaman geri açılır`,
        `${subInfo}`,
        ``,
        `### ADIM 6 — SADAKAT, CÜZDAN & KİŞİSEL TARİH`,
        `Müşterinin Rostello ile geçmişini canlı tut.`,
        ``,
        `**Çekirdek Kredi (Sadakat Programı):**`,
        `- Abonelik siparişlerinden %5 geri iade kazanılır`,
        `- Aylık kazanım sınırı 1.500 TL'dir, 14 gün bekleme süresi vardır`,
        `- Krediler yalnızca kahve ürünlerinde geçerlidir (ekipman hariç)`,
        `- Referans: arkadaşını getir, sana 100 TL kredi kazandırsın`,
        `- Kullanıcı bakiyesini ${SITE_URL}/hesabim?tab=loyalty sayfasında görebilir`,
        `- Son kullanma tarihi yoktur, abonelik aktif olduğu sürece birikir`,
        ``,
        `**Cüzdan (Prepaid Wallet):**`,
        `- Kullanıcı banka havalesi ile cüzdanına para yükleyebilir: ${SITE_URL}/cuzdan`,
        `- Havale açıklamasına referans kodunu yazması gerekir`,
        `- Admin onayından sonra bakiye kullanılabilir hale gelir`,
        `- Ödemelerde cüzdan bakiyesi kullanılabilir`,
        ``,
        `**Hesabım Dashboard'ı:**`,
        `- Kullanıcı ${SITE_URL}/hesabim sayfasında abonelik döngüsünü, sevkiyat tarihini ve profil özetini görebilir`,
        `- 3 hızlı aksiyon: Ertele (nextDelivery +7 gün), Hızlandır (kavrumu yarına çek), Dondur (duraklat)`,
        `- 5 tab: Siparişlerim, Aboneliklerim, Çekirdek Kredi, Cüzdan, Profil`,
        ``,
        `Müşteri giriş yapmışsa ve geçmişi varsa:`,
        `- "Seninle [X] kavurma yaptık. Toplamda [Y] kg kahve içtin." gibi kişisel veriler paylaş`,
        `- Daha önce denediği çekirdekleri hatırla: "Geçen ay Ethiopia Sidamo'yu sevmiştin, bu ay benzer bir profil var"`,
        `- Henüz keşfetmediği originleri belirt: "Henüz denemediğin 3 origin kaldı: Peru, Honduras, Venezuela"`,
        `- Teslimat sonrası geri bildirim iste: Paket tesliminden sonra "Son paketi nasıl buldun?" diye sor`,
        `- Her 2-3 gönderimde bir profil evrimi kontrol et: "Damağın değişti mi? Farklı bir şey denemek ister misin?"`,
        `- Referans: "Bir arkadaşını ekle, ikinize de sürpriz"`,
        `Müşteri giriş yapmamışsa bu adımı atla. Sohbet geçmişini kaydetmediğini belirt, hesap oluşturursa kalıcı olacağını söyle.`,
        ``,
        `### ADIM 7 — B2B & KURUMSAL`,
        `Şu durumlarda gündeme getir: "Ofis için arıyorum", "çalışanlarımız için", "toplantıda ikram ediyoruz", büyük miktar sipariş niyeti.`,
        `Sor: Kaç kişilik ekip? Günlük tüketim? Ofiste hangi ekipman var? Faturalı mı? Teslimat sıklığı?`,
        `Kurumsal için ${SITE_URL}/b2b sayfasına yönlendir.`,
        `Detaylı kurumsal talepler için danışmana bağlantı ver: info@rostello.com`,
        ``,
        `### ADIM 8 — EK FIRSATLAR`,
        `Doğru anda ve doğal geçişle gündeme getir:`,
        `- Hediye Paketi: "Birileri için mi arıyorsun?"`,
        `- Ekipman: "Öğütücünü değiştirmek istiyorsan seçenekler var" (${SITE_URL}/ekipmanlar)`,
        `- Yeni Hasat / Sınırlı Lot: "Bu hafta sınırlı bir Ethiopia Yirgacheffe geldi"`,
        `- Demleme Rehberi: ${SITE_URL}/demleme`,
        `- Blog: ${SITE_URL}/blog`,
        ``,
        `### ADIM 9 — DANIŞMANA BAĞLANTI`,
        `Çözemediğin veya daha derin ilgi gerektiren durumlarda: kurumsal müzakere, özel harman talebi, ekipman servisi, workshop planlaması, karmaşık şikayet.`,
        `Geçiş cümlesi: "Bu konuda sana çok daha detaylı yardımcı olabilecek kahve danışmanımıza bağlayayım mı? Sorunu, tercihlerini ve konuşmamızı aktaracağım — sıfırdan başlamak zorunda kalmayacaksın."`,
        `İletişim: info@rostello.com`,
        ``,
        `### ADIM 10 — KAPANIŞ`,
        `Her konuşmayı açık kapıyla bitir:`,
        `"Başka merak ettiğin bir şey var mı? Yeni bir çekirdek denemek, aboneliğini düzenlemek ya da demleme hakkında bir şey sormak istersen buradayım. ☕"`,
        ``,
        `## KATALOG YÖNETİMİ`,
        `Ürünleri katalogdan seç. Katalogda olmayan ürünü icat etme veya önerme.`,
        `Ürün fiyatından emin değilsen: "Güncel fiyatı site üzerinden kontrol edebilirsin."`,
        `Ürün önerirken format: [Ürün Adı] — [tat profili] · [köken] · [önerilen ekipman] · [kavurma derecesi]`,
        ``,
        `## SINIRLAR & KURALLAR`,
        `- Katalogda olmayan ürünü icat etme veya önerme.`,
        `- ASLA katalogda olmayan bir kahve, ekipman veya marka adı kullanma. Sadece aşağıdaki ÜRÜN KATALOĞU'ndaki ürünlerden seçim yap.`,
        `- ASLA Rostello dışında herhangi bir kahve markası, ekipman markası veya üçüncü taraf sitesine yönlendirme yapma.`,
        `- ASLA başka kahve markalarının ismini geçirme (Starbucks, Kahve Dünyası, Kurukahveci Mehmet Efendi vb.).`,
        `- Sadece Rostello'nun kendi ürünlerini ve sitenin kendi sayfalarını öner.`,
        `- Bir ürünü önerirken mutlaka katalogdaki gerçek adını kullan ve linkini ver: ${SITE_URL}/urunler/[slug]`,
        `- Emin olmadığın bir ürün veya konu varsa uydurma. Bunun yerine: "Bu konuda size en doğru bilgiyi verebilmek için mağazamızı kontrol edelim mi?" de.`,
        `- Fiyat bilgisinden emin değilsen: "Güncel fiyatı site üzerinden kontrol edebilirsin."`,
        `- Sağlık ve tıbbi konularda tavsiye verme; kafein duyarlılığı veya hastalık söz konusuysa doktora yönlendir.`,
        `- Müşteriyle tartışma. Farklı tat tercihi olsa bile saygı göster: "Tabii, herkesin damağı farklı — o zaman başka bir şeye bakalım."`,
        `- Kişisel verileri kaydetmediğini ve sadece aktif sohbet boyunca hatırladığını gerektiğinde belirt. Hesap oluşturursa yazılanlar kalıcı olur.`,
        `- Kahve ve Rostello ürünleriyle ilgisi olmayan sorulara: "Ben daha çok kahve konularında yardımcı olabilirim."`,
        `- Tüm çıktıların Türkçe olmak zorundadır (Rostello, Stello, ürün adları, origin isimleri hariç).`,
        ``,
        `## SİTE SAYFALARI`,
        `- Ana Sayfa: ${SITE_URL}/`,
        `- Kahveler: ${SITE_URL}/urunler`,
        `- İmza Ürünler: ${SITE_URL}/imza-urunler`,
        `- Ekipmanlar: ${SITE_URL}/ekipmanlar`,
        `- Kahveni Bul: ${SITE_URL}/ai-barista (sohbet içinde yapılır)`,
        `- Demleme Rehberi: ${SITE_URL}/demleme`,
        `- Abonelik: ${SITE_URL}/abonelik`,
        `- Abonelik Yönetimi: ${SITE_URL}/abonelik/yonetim`,
        `- Hesabım (Dashboard): ${SITE_URL}/hesabim`,
        `- Cüzdan (Wallet): ${SITE_URL}/cuzdan`,
        `- Çekirdek Kredi: ${SITE_URL}/hesabim?tab=loyalty`,
        `- B2B / Kurumsal: ${SITE_URL}/b2b`,
        `- Blog: ${SITE_URL}/blog`,
        `- Sepet: ${SITE_URL}/sepet`,
        `- Giriş: ${SITE_URL}/giris`,
        `- Kayıt: ${SITE_URL}/kayit`,
        ``,
        `## ÜRÜN KATALOĞU`,
        catalog,
      ].join("\n");
  return SYSTEM_PROMPT;
}

async function tryGemini(products: any[], session: any, message: string, threadId: string | null): Promise<{ reply: string; threadId: string | null } | null> {
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const { catalog, subInfo } = await buildContext(products, session);
    const systemPrompt = buildSystemPrompt(catalog, subInfo);

    const contents: { role: string; parts: { text: string }[] }[] = [];

    if (threadId && session?.user?.id) {
      const chatHistory = await prisma.chatMessage.findMany({
        where: { thread: { id: threadId, userId: session.user.id } },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      for (const m of chatHistory) {
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: `Sistem Talimatı:\n${systemPrompt}\n\nKullanıcı Mesajı:\n${message}` }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const reply = response.text || "Üzgünüm, bir hata oluştu.";
    return { reply, threadId };
  } catch (err: any) {
    console.warn("Gemini error (quota or other):", err?.message || err);
    return null;
  }
}

async function tryOpenAI(products: any[], session: any, message: string, threadId: string | null, signal?: AbortSignal): Promise<{ reply: string; threadId: string | null } | null> {
  try {
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY!, timeout: 10000, maxRetries: 0 });
    const { catalog, subInfo } = await buildContext(products, session);
    const systemPrompt = buildSystemPrompt(catalog, subInfo);

    const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (threadId && session?.user?.id) {
      const chatHistory = await prisma.chatMessage.findMany({
        where: { thread: { id: threadId, userId: session.user.id } },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      for (const m of chatHistory) {
        msgs.push({ role: m.role as "user" | "assistant", content: m.content });
      }
    }

    msgs.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: msgs,
      temperature: 0.7,
      max_tokens: 800,
    }, { signal });

    const reply = completion.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu.";
    return { reply, threadId };
  } catch (err: any) {
    console.warn("OpenAI error:", err?.message || err);
    return null;
  }
}

async function tryOpenRouter(products: any[], session: any, message: string, threadId: string | null, signal?: AbortSignal): Promise<{ reply: string; threadId: string | null } | null> {
  try {
    const { OpenAI } = await import("openai");
    const openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 8000,
      maxRetries: 0,
    });
    const { catalog, subInfo } = await buildContext(products, session);
    const systemPrompt = buildSystemPrompt(catalog, subInfo);

    const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (threadId && session?.user?.id) {
      const chatHistory = await prisma.chatMessage.findMany({
        where: { thread: { id: threadId, userId: session.user.id } },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      for (const m of chatHistory) {
        msgs.push({ role: m.role as "user" | "assistant", content: m.content });
      }
    }

    msgs.push({ role: "user", content: message });

    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.0-flash-lite-1k",
      messages: msgs,
      temperature: 0.7,
      max_tokens: 800,
    }, { signal });

    const reply = completion.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu.";
    return { reply, threadId };
  } catch (err: any) {
    console.warn("OpenRouter error:", err?.message || err);
    return null;
  }
}

async function tryGroq(products: any[], session: any, message: string, threadId: string | null, signal?: AbortSignal): Promise<{ reply: string; threadId: string | null } | null> {
  try {
    const { OpenAI } = await import("openai");
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY!,
      baseURL: "https://api.groq.com/openai/v1",
      timeout: 10000,
      maxRetries: 0,
    });
    const { catalog, subInfo } = await buildContext(products, session);
    const systemPrompt = buildSystemPrompt(catalog, subInfo);

    const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (threadId && session?.user?.id) {
      const chatHistory = await prisma.chatMessage.findMany({
        where: { thread: { id: threadId, userId: session.user.id } },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      for (const m of chatHistory) {
        msgs.push({ role: m.role as "user" | "assistant", content: m.content });
      }
    }

    msgs.push({ role: "user", content: message });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: msgs,
      temperature: 0.7,
      max_tokens: 800,
    }, { signal });

    const reply = completion.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu.";
    return { reply, threadId };
  } catch (err: any) {
    console.warn("Groq error:", err?.message || err);
    return null;
  }
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
    // Fetch products and session early — needed for both Kahveni Bul and normal flow
    let session: any = null;
    try { session = await auth(); } catch {}

    const dbProducts = await getProducts();
    const products = dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;
    const useAI = dbProducts.length > 0;

    // Early Kahveni Bul check — skip AI entirely
    const lowerMsg = message.replace(/İ/g, "i").toLowerCase();
    const isKahveBulRequest = /bana kahve öner|kahveni bul|test.*(?:yap|başlat)/i.test(lowerMsg);
    const currentThreadId = threadId;
    const hasKahveState = kahveStateMap.has(currentThreadId);

    if (isKahveBulRequest || hasKahveState) {
      const reply = await getFallbackReply(message, products, currentThreadId);
      let newThreadId: string | null = currentThreadId;
      if (session?.user?.id) {
        try {
          if (!newThreadId) {
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
            newThreadId = thread.id;
            if (kahveStateMap.has(null)) {
              const st = kahveStateMap.get(null)!;
              kahveStateMap.delete(null);
              kahveStateMap.set(newThreadId, st);
            }
          } else {
            await prisma.chatMessage.createMany({
              data: [
                { threadId: newThreadId, role: "user", content: message },
                { threadId: newThreadId, role: "assistant", content: reply },
              ],
            });
          }
        } catch (e) {
          console.warn("Sohbet kaydı başarısız:", (e as any)?.message);
        }
      }
      return NextResponse.json({ reply, threadId: newThreadId });
    }

    // Normal flow: AI providers
    let reply: string;

    // Instant reply for known questions — bypass AI entirely
    const knownReply = matchQuestion(message, products);
    if (knownReply) {
      reply = knownReply;
      let responseThreadId: string | null = currentThreadId;
      if (session?.user?.id) {
        try {
          if (!responseThreadId) {
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
            responseThreadId = thread.id;
          } else {
            await prisma.chatMessage.createMany({
              data: [
                { threadId: responseThreadId, role: "user", content: message },
                { threadId: responseThreadId, role: "assistant", content: reply },
              ],
            });
          }
        } catch (e) {
          console.warn("Sohbet kaydı başarısız (bilinen soru):", (e as any)?.message);
        }
      }
      return NextResponse.json({ reply, threadId: responseThreadId });
    }

    async function tryProvider(name: string, signal?: AbortSignal): Promise<{ reply: string; threadId: string | null } | null> {
      if (name === "openrouter" && hasKey("OPENROUTER_API_KEY"))
        return tryOpenRouter(products, session, message, currentThreadId, signal);
      if (name === "groq" && hasKey("GROQ_API_KEY"))
        return tryGroq(products, session, message, currentThreadId, signal);
      if (name === "gemini" && hasKey("GEMINI_API_KEY"))
        return tryGemini(products, session, message, currentThreadId);
      if (name === "openai" && hasKey("OPENAI_API_KEY"))
        return tryOpenAI(products, session, message, currentThreadId, signal);
      return null;
    }

    const providers = ["groq", "openrouter", "gemini", "openai"];
    let aiResult: { reply: string; threadId: string | null } | null = null;

    if (useAI) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        aiResult = await Promise.any(
          providers.map((p) =>
            tryProvider(p, controller.signal).then((r) => {
              if (!r) throw new Error("provider returned null");
              return r;
            })
          )
        );
      } catch {
        // All failed or timed out — fall through to getFallbackReply
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (aiResult) {
      if (validateAIResponse(aiResult.reply, products)) {
        reply = aiResult.reply;
      } else {
        console.warn("AI response invalid (hallucination detected), using fallback");
        aiResult = null;
        reply = await getFallbackReply(message, products, currentThreadId);
      }
    } else {
      reply = await getFallbackReply(message, products, currentThreadId);
    }

    let responseThreadId: string | null = currentThreadId;
    if (session?.user?.id) {
      try {
        if (!responseThreadId) {
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
          responseThreadId = thread.id;
          if (kahveStateMap.has(null)) {
            const st = kahveStateMap.get(null)!;
            kahveStateMap.delete(null);
            kahveStateMap.set(responseThreadId, st);
          }
        } else {
          await prisma.chatMessage.createMany({
            data: [
              { threadId: responseThreadId, role: "user", content: message },
              { threadId: responseThreadId, role: "assistant", content: reply },
            ],
          });
        }
      } catch (e) {
        console.warn("Sohbet kaydı başarısız (oturum sorunu):", (e as any)?.message);
      }
    }

    return NextResponse.json({ reply, threadId: responseThreadId });
  } catch (error: any) {
    console.error("AI chat error:", error?.message || error, "Message was:", message);
    try {
      const fallbackReply = await getFallbackReply(message || "merhaba", FALLBACK_PRODUCTS, null);
      return NextResponse.json({ reply: fallbackReply, threadId: null });
    } catch {
      return NextResponse.json({ reply: "Üzgünüm, bir teknik aksaklık yaşıyorum. Lütfen biraz sonra tekrar dener misiniz? ☕", threadId: null });
    }
  }
}
