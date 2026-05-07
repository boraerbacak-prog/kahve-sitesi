import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kahve-sitesi.vercel.app";

const FALLBACK_PRODUCTS = [
  { name: "Guatemala SHB 18 SC", slug: "guatemala-shb-18-sc", price: 1380, roastLevel: "medium", body: "Full", acidity: "Medium", flavorNotes: '["kakao","baharat","fındık"]', origin: "Guatemala", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Guatemala", slug: "guatemala", price: 1355, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["karamel","badem","sütlü çikolata"]', origin: "Guatemala", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Colombia Supremo 18 SC", slug: "colombia-supremo-18-sc", price: 1365, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["karamel","kırmızı meyve","çikolata"]', origin: "Colombia", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Brasil Mogiana", slug: "brasil-mogiana", price: 1310, roastLevel: "medium", body: "Full", acidity: "Low", flavorNotes: '["fındık","çikolata","karamel"]', origin: "Brezilya", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Rio Minas 17-18 2/3 (TK)", slug: "rio-minas", price: 1200, roastLevel: "medium", body: "Medium", acidity: "Low", flavorNotes: '["çikolata","fındık","tahıl"]', origin: "Brezilya", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Sidamo G2", slug: "ethiopia-sidamo-g2", price: 1310, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["çiçek","limon","bergamot"]', origin: "Etiyopya", featured: true, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Sidamo G4", slug: "ethiopia-sidamo-g4", price: 1175, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["yasemin","limon","çiçek"]', origin: "Etiyopya", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Lekempt G4", slug: "ethiopia-lekempt-g4", price: 1175, roastLevel: "light", body: "Light", acidity: "Medium", flavorNotes: '["çiçek","şeftali","çay"]', origin: "Etiyopya", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Rwanda Kula Project", slug: "rwanda-kula-project", price: 1040, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["çilek","vişne","pembe meyveler"]', origin: "Ruanda", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Rwanda Impexcor", slug: "rwanda-impexcor", price: 1040, roastLevel: "light", body: "Medium", acidity: "Medium", flavorNotes: '["kırmızı meyve","karamel","pembe meyveler"]', origin: "Ruanda", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Peru Grade 1", slug: "peru-grade-1", price: 1040, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["fındık","çikolata","portakal"]', origin: "Peru", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Venezuela", slug: "venezuela", price: 1040, roastLevel: "medium", body: "Medium", acidity: "Low", flavorNotes: '["badem","sütlü çikolata","fındık"]', origin: "Venezuela", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Honduras", slug: "honduras", price: 1040, roastLevel: "medium", body: "Medium", acidity: "Medium", flavorNotes: '["kavun","bal","karamel"]', origin: "Honduras", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Costa Rica Terrazu", slug: "costa-rica-terrazu", price: 1265, roastLevel: "medium", body: "Medium", acidity: "High", flavorNotes: '["portakal","bal","kırmızı meyve"]', origin: "Kosta Rika", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Uganda Robusta", slug: "uganda-robusta", price: 815, roastLevel: "dark", body: "Full", acidity: "Low", flavorNotes: '["bitter","fındık","kakao"]', origin: "Uganda", featured: false, category: { name: "Standart Çekirdek" } },
  { name: "Ethiopia Yirga Koke Honey G1", slug: "ethiopia-yirga-koke-honey-g1", price: 1825, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["çiçek","bal","bergamot"]', origin: "Etiyopya", featured: true, category: { name: "Specialty" } },
  { name: "Ethiopia Chelbessa Danche G1", slug: "ethiopia-chelbessa-danche-g1", price: 1825, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["yasemin","limon","çiçek"]', origin: "Etiyopya", featured: true, category: { name: "Specialty" } },
  { name: "Ethiopia Ariacha G1", slug: "ethiopia-ariacha-g1", price: 1825, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["şeftali","çiçek","bergamot"]', origin: "Etiyopya", featured: false, category: { name: "Specialty" } },
  { name: "Colombia La Roca Pink Bourbon", slug: "colombia-la-roca-pink-bourbon", price: 2260, roastLevel: "light", body: "Light", acidity: "High", flavorNotes: '["pembe meyveler","çiçek","bal"]', origin: "Colombia", featured: true, category: { name: "Specialty" } },
  { name: "Colombia El Paraiso", slug: "colombia-el-paraiso", price: 2260, roastLevel: "light", body: "Medium", acidity: "High", flavorNotes: '["kırmızı meyve","karamel","pembe meyveler"]', origin: "Colombia", featured: false, category: { name: "Specialty" } },
  { name: "Colombia La Reserva", slug: "colombia-la-reserva", price: 1985, roastLevel: "light", body: "Medium", acidity: "Medium", flavorNotes: '["kırmızı meyve","çiçek","bal"]', origin: "Colombia", featured: false, category: { name: "Specialty" } },
];

function plink(name: string, slug: string, price: number) {
  return `[${name}]({url}/urunler/${slug}) — ${price.toLocaleString("tr-TR")}₺/kg`.replace("{url}", SITE_URL);
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
  { name: "Başlangıç", price: "199", desc: "Ayda 1 paket (250g), her ay farklı çekirdek, ücretsiz kargo" },
  { name: "Keyif", price: "379", desc: "Ayda 2 paket (250g x2), en popüler, özel indirim" },
  { name: "Gurme", price: "549", desc: "Ayda 3 paket (250g x3), specialty seçkiler, öncelikli destek" },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function fmtProd(p: any): string {
  const n = pnotes(p);
  return `${plink(p.name, p.slug, p.price)}${n ? " | " + n : ""}`;
}

const questions: {
  patterns: RegExp[];
  response: (msg: string, products: any[]) => string | null;
}[] = [
  {
    patterns: [/merhaba/i, /selam/i, /hey/i, /günaydın/i, /iyi günler/i],
    response: () =>
      "Merhaba! ☕ Ben **Rostello'nun Baş Baristası**. Size nasıl yardımcı olabilirim?\n\nKahve önerisi için:\n• [Kahveni Bul]({url}/damak-testi) testimizi çözün\n• Ya da bana kahve tercihlerinizi anlatın\n\nÖrneğin: *\"Sütlü kahve önerir misin?\"* ya da *\"Meyvemsi bir şey arıyorum\"*\n\nAşağıdaki konularda da bilgi verebilirim:\n[Demleme]({url}/demleme) · [Abonelik]({url}/abonelik) · [B2B]({url}/b2b)".replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/nasılsın/i, /naber/i, /naptın/i],
    response: () =>
      "Harikayım, teşekkür ederim! ☕ Yeni kahveler kavruluyor, damakları şenlendirmek için sabırsızlanıyorum.\n\nSize nasıl yardımcı olabilirim? İsterseniz [Kahveni Bul]({url}/damak-testi) testiyle size en uygun kahveyi bulalım!".replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/sütlü/i, /latte/i, /cappuccino/i, /flat white/i, /süt/i, /filtre kahve/i],
    response: (_msg, products) => {
      const suitable = products.filter((p: any) =>
        p.body === "Full" || p.roastLevel === "dark" || p.roastLevel === "medium"
      );
      if (suitable.length === 0) return null;
      const list = suitable.slice(0, 4).map(fmtProd).join("\n");
      return `Sütlü kahve severler için en uygun seçenekler:\n\n${list}\n\nBu kahveler sütle harika uyum sağlar. 💫\n\nDilerseniz:\n• [Kahveni Bul]({url}/damak-testi) ile keşfedin\n• [Tüm ürünlere]({url}/urunler) göz atın\n• Bana söyleyin: *\"Soğuk içerim\"* veya *\"Meyvemsi istiyorum\"*`.replace(/\{url\}/g, SITE_URL);
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
      return `Meyvemsi ve çiçeksi notalar arayanlara özel:\n\n${list}\n\n🌸 Bu kahveler özellikle Etiyopya kökenliler olmak üzere parlak asiditeleriyle öne çıkar.\n\n[Kahveni Bul]({url}/damak-testi) testimizle daha fazla keşfedebilirsiniz.`.replace(/\{url\}/g, SITE_URL);
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
      return `Dolgun ve çikolatalı notalar için ideal seçenekler:\n\n${list}\n\n🍫 Bu kahveler Guatemala, Brezilya ve Uganda kökenliler olup sütle de harika gider.\n\n[Kahveni Bul]({url}/damak-testi) testimizle daha fazla keşfedin.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/v60.*kahve/i, /french.*press.*kahve/i, /ekipman.*öner/i, /hangi.*ekipman/i, /ekipman.*hangi/i, /moka.*kahve/i, /aeropress.*kahve/i, /cezve.*kahve/i, /filtre.*makine.*kahve/i],
    response: (msg, products) => {
      const lm = msg.toLowerCase();
      const equipMap: Record<string, string> = { v60: "v60", french: "french-press", press: "french-press", moka: "moka", aeropress: "aeropress", cezve: "cezve", soğuk: "cold-brew", cold: "cold-brew" };
      let equip = "general";
      for (const [key, val] of Object.entries(equipMap)) { if (lm.includes(key)) { equip = val; break; } }
      const mapped = products.filter((p: any) => {
        const r = p.roastLevel || "";
        if (equip === "v60") return r === "light" || r === "medium";
        if (equip === "french-press") return r === "medium" || r === "dark";
        if (equip === "moka") return r === "medium" || r === "dark";
        if (equip === "aeropress") return true;
        if (equip === "cezve") return r === "medium" || r === "dark";
        if (equip === "cold-brew") return r === "medium" || r === "dark";
        return true;
      }).slice(0, 4);
      if (mapped.length === 0) return null;
      const list = mapped.map(fmtProd).join("\n");
      const equipNames: Record<string, string> = { v60: "V60", "french-press": "French Press", moka: "Moka Pot", aeropress: "Aeropress", cezve: "Cezve", "cold-brew": "Soğuk Demleme", general: "ekipmanınız" };
      return `**${equipNames[equip]}** için önerdiğim kahveler:\n\n${list}\n\n📍 [Kahveni Bul]({url}/damak-testi) testiyle daha kişisel öneriler alın.`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/kahveni bul/i, /test/i, /profil/i, /bul/i],
    response: () =>
      "Kahveni Bul testi ile size en uygun kahveyi bulalım! 🎯\n\nBirkaç soruyla damak tadınıza ve ekipmanınıza göre özel öneriler.\n\n[Hemen başlayın →]({url}/damak-testi)\n\nYa da bana şunları söyleyin:\n• **Sütlü** mü içersiniz?\n• **Sade/Siyah** mı tercih edersiniz?\n• Hangi **ekipmanı** kullanıyorsunuz?\n• **Meyvemsi** mi, **çikolatalı** mı?".replace(/\{url\}/g, SITE_URL),
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
      return `Specialty kahvelerimiz ☕🏆\n\n${list}\n\nSpecialty coffee, 80+ puan almış, tek köken, izlenebilir çekirdeklerdir.\n[Tüm specialty kahveler]({url}/urunler) · [Kahveni Bul]({url}/damak-testi)`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/öner/i, /tavsiye/i, /seç/i, /ne al/i, /karar/i, /ürün/i, /hangisini/i, /kahve.*ön/i, /kahve/i],
    response: (_msg, products) => {
      const featured = products.filter((p: any) => p.featured).slice(0, 4);
      if (featured.length > 0) {
        const list = featured.map(fmtProd).join("\n");
        return `Öne çıkan kahvelerimiz:\n\n${list}\n\nHangisi ilginizi çekti? Size daha iyi yardımcı olabilmem için hangi tür kahve aradığınızı seçin:\n\n🥛 **Sütlü** içerim — latte, cappuccino\n⚫ **Sade** içerim — filtre, espresso\n🧊 **Soğuk** severim — cold brew\n🌸 **Meyvemsi** — çiçeksi, hafif\n🍫 **Çikolatalı** — dolgun, sert\n🧪 **Specialty** — tek köken, özel üretim`;
      }
      return `Size nasıl bir kahve lazım? 🤔\n\n🥛 **Sütlü mü?** Latte, cappuccino için uygun kahveler\n⚫ **Sade/Siyah mı?** Filtre, espresso için ideal seçenekler\n🧊 **Soğuk mu?** Cold brew, iced latte için\n🌸 **Meyvemsi mi?** Çiçeksi, hafif kavrumlar\n🍫 **Çikolatalı mı?** Dolgun, sert kavrumlar\n🔬 **Specialty mi?** Tek köken, özel üretimler\n\nYa da [Kahveni Bul]({url}/damak-testi) testimizi çözün, size en uygun kahveyi bulalım! 🎯`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/günde/i, /kaç fincan/i, /fincan.*iç/i, /günlük.*tüketim/i, /haftada.*kaç/i, /ayda.*kaç/i, /ne kadar.*iç/i],
    response: (msg) => {
      const lm = msg.toLowerCase();
      if (lm.includes("1") || lm.includes("bir")) return `Günde 1 fincan için **Başlangıç** (199 ₺/ay) paketi yeterli. Ayda 1 paket (250g) taze kavrum kahve, ücretsiz kargo. Düzenli kahve keyfi için ideal! ☕\n\nDetaylı bilgi: [Abonelik]({url}/abonelik)`.replace("{url}", SITE_URL);
      if (lm.includes("2") || lm.includes("3") || lm.includes("iki") || lm.includes("üç")) return `Günde 2-3 fincan için **Keyif** (379 ₺/ay) paketi en popüler seçenek! Ayda 2 paket (250g x2), özel indirimli fiyat. Farklı çekirdekleri keşfetmek isteyenler için ideal.\n\nDetaylı bilgi: [Abonelik]({url}/abonelik)`.replace("{url}", SITE_URL);
      if (lm.includes("4") || lm.includes("5") || lm.includes("dört") || lm.includes("beş") || lm.includes("fazla") || lm.includes("çok")) return `Günde 3+ fincan için **Gurme** (549 ₺/ay) paketi! Ayda 3 paket (250g x3), specialty seçkiler ve öncelikli müşteri desteği. Kahve tutkunları için tasarlandı.\n\nDetaylı bilgi: [Abonelik]({url}/abonelik)`.replace("{url}", SITE_URL);
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
      const list = subscriptions.map((s) => `**${s.name}** (${s.price} ₺/ay): ${s.desc}`).join("\n");
      return `Abonelik paketlerimiz:\n\n${list}\n\n**Biraz daha bilgi verir misiniz?** 🤔\n\n☕ Günde kaç fincan kahve içiyorsunuz?\n• 1 fincan — **Başlangıç** paketi yeterli\n• 2-3 fincan — **Keyif** paketi ideal\n• 3+ fincan — **Gurme** paketi önerilir\n\n🔄 Yeni lezzetler dener misiniz?\n• **Evet** — Her ay farklı çekirdek gönderiyoruz\n• **Hayır** — Sürekli aynı kahveyi alabilirsiniz\n\nTüm paketlerde dilediğiniz zaman iptal hakkınız var.\n[Abonelik sayfamız]({url}/abonelik) — [Bize yazın](mailto:info@rostello.com)`.replace(/\{url\}/g, SITE_URL);
    },
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
      const min = sorted[0].price.toLocaleString("tr-TR");
      const max = sorted[sorted.length - 1].price.toLocaleString("tr-TR");
      return `Fiyat aralığımız **${min}₺** ile **${max}₺** arasında.\n\nEn uygun: ${plink(sorted[0].name, sorted[0].slug, sorted[0].price)}\nPremium: ${plink(sorted[sorted.length - 1].name, sorted[sorted.length - 1].slug, sorted[sorted.length - 1].price)}\n\n[Tüm ürünler]({url}/urunler) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/v60/i, /demle/i, /french press/i, /pour over/i, /filtre/i, /cold brew/i, /moka/i, /aeropress/i],
    response: (msg) => {
      const method = Object.entries(brewingMethods).find(([key]) => msg.toLowerCase().includes(key));
      if (method) {
        return `${method[1].name} ☕\n\n${method[1].desc}\n\n[Demleme Rehberi]({url}/demleme) — [Bu yönteme uygun kahveler]({url}/urunler)`.replace(/\{url\}/g, SITE_URL);
      }
      return `Demleme yöntemlerimiz:\n\n${Object.values(brewingMethods).map((m) => `**${m.name}**`).join("\n")}\n\nHangisiyle ilgileniyorsunuz? Detaylı anlatım için [Demleme Rehberi]({url}/demleme)`.replace(/\{url\}/g, SITE_URL);
    },
  },
  {
    patterns: [/ekipman/i, /alet/i, /malzeme/i, /terazi/i, /kettle/i, /değirmen/i, /kahve makinesi/i],
    response: () =>
      `Ekipmanlarımız:\n\n• [V60 Dripper]({url}/ekipmanlar) — 350 ₺\n• [French Press]({url}/ekipmanlar) — 450 ₺\n• [Aeropress]({url}/ekipmanlar) — 750 ₺\n• [Dijital Terazi]({url}/ekipmanlar) — 890 ₺\n• [Su Isıtıcı]({url}/ekipmanlar) — 1.290 ₺\n• [El Değirmeni]({url}/ekipmanlar) — 1.590 ₺\n\n[Tüm ekipmanlar]({url}/ekipmanlar) · [Hangi ekipmana hangi kahve?]({url}/damak-testi)`.replace(/\{url\}/g, SITE_URL),
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
      "Rica ederim! ☕ Ne zaman kahveyle ilgili bir sorunuz olsa buradayım.\n\n[Mağaza]({url}/urunler) · [Abonelik]({url}/abonelik) · [Kahveni Bul]({url}/damak-testi)".replace(/\{url\}/g, SITE_URL),
  },
  {
    patterns: [/görüş/i, /bay/i, /hoşça/i, /güle/i],
    response: () =>
      "Hoşça kalın! ☕ Umarım size en uygun kahveyi bulmanıza yardımcı olabilmişimdir. Yeni lezzetlerle tekrar görüşmek üzere! [Rostello]({url}/)".replace("{url}", SITE_URL),
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

  const sample = products.length > 0
    ? products.slice(0, 4).map(fmtProd).join("\n")
    : "";

  const fallbacks = [
    `Size nasıl yardımcı olabilirim? 🤔\n\n🥛 **Sütlü** mü içersiniz?\n⚫ **Sade** mi?\n🌸 **Meyvemsi** mi, 🍫 **çikolatalı** mı?\n\nYa da [Kahveni Bul]({url}/damak-testi) testimizi çözün! 🎯`.replace(/\{url\}/g, SITE_URL),
    `Anladım! Size daha iyi yardımcı olabilmem için birkaç soru:\n\n• Kahveyi **sütlü** mü, **sade** mi içersiniz?\n• Hangi **ekipmanı** kullanıyorsunuz?\n• **Meyvemsi** notalar mı, **çikolatalı** mı?\n\n[Ürünler]({url}/urunler) · [Kahveni Bul]({url}/damak-testi) · [Abonelik]({url}/abonelik)`.replace(/\{url\}/g, SITE_URL),
    ...(sample ? [`Öne çıkan ürünler:\n\n${sample}\n\nİlginizi çeken oldu mu? Ya da bana tercihlerinizi söyleyin, size özel öneri yapayım!`] : []),
  ];

  return pick(fallbacks);
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

    let dbProducts: any[] = [];
    try {
      dbProducts = await prisma.product.findMany({
        where: { published: true },
        include: { category: true },
      });
    } catch (dbError) {
      console.error("DB error in AI chat:", dbError);
    }

    const products = dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;

    let reply: string;
    let currentThreadId = threadId;

    if (hasOpenAIKey() && dbProducts.length > 0) {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const productCatalog = products.map((p: any) =>
        `- ${p.name} — ${p.origin || "Menşei bilinmiyor"} | ${p.category?.name || ""} | ${p.price.toLocaleString("tr-TR")}₺/kg | Kavrum: ${p.roastLevel === "light" ? "Hafif" : p.roastLevel === "medium" ? "Orta" : "Koyu"} | Detay: ${SITE_URL}/urunler/${p.slug}`
      ).join("\n");

      const SYSTEM_PROMPT = [
        `SEN ROSTELLO'NUN BAŞ BARISTASISIN.`,
        `KİŞİLİK: Kibar, uzman, tutkulu, çözüm odaklı. Satış temsilcisi değil, kahve rehberi gibi konuş. Türkçe konuş.`,
        `GÖREVLERİN:`,
        `1. MÜŞTERİ ANALİZİ: Kahveyi nasıl sevdiğini sor (sütlü/sert/meyvemsi/çikolatalı/soğuk).`,
        `2. KAHVE ÖNERİSİ: Katalogdaki ürünlere göre öner, link ver. 3-4 ürün öner.`,
        `3. ABONELİK: Günlük tüketimini sor, paket öner.`,
        `4. SİTE HAKİMİYETİ: Demleme, abonelik, B2B, Kahveni Bul sayfalarına yönlendir.`,
        `KISITLAMALAR: Her yanıtında yönlendirme linki olmalı. Rostello dışı markaları övme. Linklerde tam URL kullan.`,
        ``,
        `Site Sayfaları:`,
        `- Ana Sayfa: ${SITE_URL}/`,
        `- Kahveler: ${SITE_URL}/urunler`,
        `- İmza Ürünler: ${SITE_URL}/imza-urunler`,
        `- Ekipmanlar: ${SITE_URL}/ekipmanlar`,
        `- Kahveni Bul: ${SITE_URL}/damak-testi`,
        `- Demleme: ${SITE_URL}/demleme`,
        `- Abonelik: ${SITE_URL}/abonelik`,
        `- B2B: ${SITE_URL}/b2b`,
        `- Blog: ${SITE_URL}/blog`,
        `- Sepet: ${SITE_URL}/sepet`,
        ``,
        `Abonelik: Başlangıç 199₺/ay (günde 1 fincan), Keyif 379₺/ay (günde 2-3 fincan), Gurme 549₺/ay (günde 3+ fincan).`,
        `Sipariş: 24 saat içinde kavrulup kargoya verilir. 14 gün iade.`,
        ``,
        `Ürün Kataloğu:`,
        productCatalog,
      ].join("\n");

      const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: SYSTEM_PROMPT },
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
    try {
      const fallbackReply = await getFallbackReply(message || "merhaba", FALLBACK_PRODUCTS);
      return NextResponse.json({ reply: fallbackReply, threadId: null });
    } catch {
      return NextResponse.json({ reply: "Üzgünüm, bir teknik aksaklık yaşıyorum. Lütfen biraz sonra tekrar dener misiniz? ☕", threadId: null });
    }
  }
}
