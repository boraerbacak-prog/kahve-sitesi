import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import SectionAudio from "@/components/SectionAudio";

interface Block {
  id: string; section: string; blockType: string;
  title: string; subtitle: string; content: string;
  imageUrl: string; imageSize: string;
  audioUrl: string;
  linkUrl: string; linkText: string;
  badgeText: string; sortOrder: number;
  isActive: boolean; styles: string;
}

function parseStyles(s: string): Record<string, string> {
  try { return JSON.parse(s); } catch { return {}; }
}

function HeroHeading({ block }: { block: Block }) {
  const s = parseStyles(block.styles);
  return (
    <div className={s.marginBottom || "mb-6"}>
      <h1 className={s.textSize || "text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] tracking-tight leading-tight"}
        dangerouslySetInnerHTML={{ __html: block.title }} />
    </div>
  );
}

const productImages = [
  "/celsus/urun/urun1.png",
  "/celsus/urun/urun2.png",
  "/celsus/urun/urun3.png",
];

function FilmReel() {
  const items = [...productImages, ...productImages];
  return (
    <div className="flex flex-col items-center shrink-0 z-10">
      <div style={{ width: "168px", height: "468px" }}>
        <div className="relative overflow-hidden" style={{ transform: "scale(1.2)", transformOrigin: "top left", width: "140px", height: "390px" }}>
          <div className="absolute inset-x-0 top-0 h-10 z-10 bg-gradient-to-b from-[#f5f2ed] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-10 z-10 bg-gradient-to-t from-[#f5f2ed] to-transparent" />
          <div className="flex flex-col animate-scroll-down">
            {items.map((src, i) => (
              <div key={i} className="relative w-[140px] h-[130px] shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C4724B]/20 via-transparent to-[#D4A574]/10 z-10 pointer-events-none" />
                <Image src={src} alt="" fill className="object-contain p-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-xs tracking-[0.15em] uppercase text-[#C4724B] font-semibold">Taze Kavurum</p>
        <p className="text-xs tracking-[0.1em] uppercase text-[#8c8c8c] font-medium mt-0.5">Üstün Lezzet Deneyimi</p>
      </div>
    </div>
  );
}

function HeroKahveniBul({ block }: { block: Block }) {
  const s = parseStyles(block.styles);
  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 animate-fade-in-up">
      <div className={`relative ${block.imageSize || "w-[420px] h-[420px] lg:w-[540px] lg:h-[540px]"} shrink-0`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C4724B] to-[#D4A574] animate-pulse opacity-15" />
        <div className="relative w-full h-full rounded-full overflow-hidden animate-slow-spin">
          <Image src={block.imageUrl} alt="Kahveni Bul" fill className="object-contain" />
        </div>
      </div>
      <div className="flex-1 min-w-0 text-center lg:text-left px-4 z-10">
        <span className={`block ${s.titleSize || "text-3xl lg:text-4xl"} font-bold text-[#1a1a1a] leading-tight`}>{block.title}</span>
        <p className={`${s.contentSize || "text-base lg:text-lg"} text-[#4a4a4a] mt-3 leading-relaxed max-w-sm mx-auto lg:mx-0`}>
          {block.content}
        </p>
          <Link href="/damak-testi"
            className={`inline-flex items-center gap-2 text-white ${s.buttonSize || "px-8 py-4 text-sm"} font-semibold tracking-wide uppercase transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 mt-6`}
            style={{
              background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
              backgroundSize: "200% auto",
              animation: "copper-shimmer 3s linear infinite",
            }}>
            Kahveni Keşfet
          </Link>
      </div>
      <FilmReel />
      <SectionAudio src={block.audioUrl} />
    </div>
  );
}

function HeroBarista({ block }: { block: Block }) {
  const s = parseStyles(block.styles);
  return (
    <Link href={block.linkUrl || "/ai-barista"}
      className={`group relative animate-fade-in-up delay-2 ${s.cardStyle || "bg-white border-2 border-[#D4A574] hover:border-[#C4724B]"} px-10 py-8 transition-all duration-300 w-full hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center gap-6">
        <div className={`relative ${block.imageSize || "w-20 h-20"} shrink-0`}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C4724B] animate-pulse opacity-30" />
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#D4A574]/30 group-hover:border-[#C4724B]/50 transition-colors">
            <Image src={block.imageUrl} alt="Barista" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-lg font-bold text-[#1a1a1a] group-hover:text-[#C4724B] transition-colors">{block.title}</span>
          <span className="text-sm text-[#666] mt-1 block leading-relaxed">{block.content}</span>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const blocks = await prisma.homepageBlock.findMany({
    where: { isActive: true, section: "hero" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <section className="relative min-h-[90vh] bg-[#f5f2ed] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/8 via-transparent to-[#C4724B]/5" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-[#D4A574]/8 via-[#C4724B]/3 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C4724B]/8 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-24 h-24 rounded-full bg-[#D4A574]/10 blur-xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full bg-[#C4724B]/10 blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxYTFhMWEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="flex flex-col gap-6">
            {blocks.map((block) => {
              switch (block.blockType) {
                case "hero-heading": return <HeroHeading key={block.id} block={block} />;
                case "hero-kahveni-bul": return <HeroKahveniBul key={block.id} block={block} />;
                case "hero-barista": return <HeroBarista key={block.id} block={block} />;
                default: return null;
              }
            })}
          </div>
        </div>
      </section>

      {/* Barista ile Konuş Section */}
      <section className="relative bg-[#2c1810]">
        <div className="relative w-full max-h-[80vh] overflow-hidden">
          <Image src="/celsus/maskot/maskot2.jpg" alt="" width={1376} height={768} className="w-full h-auto" sizes="100vw" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(15,9,6,0.95) 0%, rgba(15,9,6,0.85) 35%, rgba(26,15,10,0.3) 60%, transparent 100%)" }} />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-lg">
                <p className="text-xl sm:text-2xl lg:text-3xl text-white leading-relaxed font-medium drop-shadow-2xl [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
                  Kahve seçiminden demleme önerilerine, ekipman tavsiyelerinden sipariş süreçlerine kadar her an yanınızda olan kişisel kahve asistanınız.
                </p>
                <div className="mt-8">
                  <Link href="/ai-barista"
                    className="inline-flex items-center gap-2 text-white px-12 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
                    style={{
                      background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                      backgroundSize: "200% auto",
                      animation: "copper-shimmer 3s linear infinite",
                    }}>
                    Baristayı Aç →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demleme Teknikleri Section */}
      <section className="relative bg-[#ebe7e0] py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/celsus/demleme/demleme2.png" alt="" fill className="object-cover opacity-15" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#ebe7e0]/80 via-[#ebe7e0]/50 to-[#ebe7e0]/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Rehber</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Demleme Yöntemleri</h2>
            <p className="text-[#4a4a4a] max-w-lg mx-auto text-lg">Doğru demleme tekniğiyle kahvenizden maksimum lezzeti alın.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "V60 Pour Over", desc: "Hafif ve aromatik filtre kahve için ideal." },
              { title: "French Press", desc: "Dolgun gövdeli, zengin tat profili." },
              { title: "Espresso", desc: "Yoğun ve konsantre, her yudumda lezzet." },
              { title: "Soğuk Demleme", desc: "Düşük asiditeli, yumuşak soğuk kahve." },
            ].map((method) => (
              <Link key={method.title} href="/demleme"
                className="group bg-white border border-[#e5e0d8] p-8 text-center hover:border-[#C4724B]/30 transition-all hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{method.title}</h3>
                <p className="text-sm text-[#666]">{method.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/demleme"
              className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
              style={{
                background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}>
              Tüm Yöntemleri İncele →
            </Link>
          </div>
        </div>
      </section>

      {/* Abonelik Section */}
      <section className="relative bg-[#f5f2ed] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Abonelik</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Kahve Aboneliği ile <span className="text-[#C4724B]">Farkı Keşfedin</span></h2>
            <p className="text-[#4a4a4a] max-w-xl mx-auto">
              Her ay kapınıza gelen taze kavrulmuş kahveler. Size özel hazırlanan abonelik paketlerimizle kahve keyfinizi kesintisiz yaşayın.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto mb-16">
            {[
              { title: "Taze Kavrum", desc: "Sipariş üzerine kavrulur, maksimum tazelik" },
              { title: "Ücretsiz Kargo", desc: "Her abonelik teslimatında kargo bizden" },
              { title: "Kişisel Seçim", desc: "Kendi kahveni seç, karışımını belirle" },
              { title: "Sana Özel", desc: "İhtiyacına göre oluştur, durdur, değiştir" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-px bg-[#D4A574]/40 mx-auto mb-5" />
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-1 uppercase tracking-wide">{item.title}</h3>
                <p className="text-xs text-[#666]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/abonelik"
              className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
              style={{
                background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}>
              Abonelik Paketleri →
            </Link>
          </div>
        </div>
      </section>

      {/* Sadakat Programi Section */}
      <section className="relative bg-[#f8f6f3] py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#C4724B]/5 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Sadakat</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">
              Rostello <span className="text-[#C4724B]">Sadakat Programı</span>
            </h2>
            <p className="text-[#666] max-w-xl mx-auto text-lg">
              Her alışverişinde puan kazan, seviye atla, ayrıcalıklı üye olmanın tadını çıkar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {[
              { step: "01", title: "Kazan", desc: "Her 1₺'lik alışverişinde puan kazan. Hoş geldin olarak sana 500 puan hediye!" },
              { step: "02", title: "Yüksel", desc: "Bronz'dan başla, Gümüş'e, sonra Altın'a yüksel. Her seviyede indirim ve ayrıcalıklar seni bekliyor." },
              { step: "03", title: "Ödül", desc: "Puanlarını indirim olarak kullan, seviyene özel fırsatları yakala, doğum gününde sürpriz hediyeler al." },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-[#C4724B]/10 border border-[#C4724B]/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#C4724B]/20 transition">
                  <span className="text-2xl font-bold text-[#C4724B]">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{item.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tier Table */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="grid grid-cols-3 gap-px bg-[#e5e0d8] rounded-xl overflow-hidden">
              {[
                { tier: "Bronz", range: "0 - 1.000 ₺", discount: "%0", ship: "990 ₺ üzeri", color: "bg-white" },
                { tier: "Gümüş", range: "1.000 - 3.000 ₺", discount: "%5", ship: "500 ₺ üzeri", color: "bg-white" },
                { tier: "Altın", range: "3.000 ₺ ve üzeri", discount: "%10", ship: "Bedava", color: "bg-white" },
              ].map((t) => (
                <div key={t.tier} className={`${t.color} p-6 text-center`}>
                  <p className={`text-lg font-bold mb-3 ${
                    t.tier === "Altın" ? "text-yellow-700" : t.tier === "Gümüş" ? "text-gray-500" : "text-amber-700"
                  }`}>{t.tier}</p>
                  <div className="space-y-2 text-sm text-[#666]">
                    <p>Harcama: <span className="text-[#1a1a1a] font-medium">{t.range}</span></p>
                    <p>İndirim: <span className="text-green-700 font-semibold">{t.discount}</span></p>
                    <p>Kargo: <span className="text-[#1a1a1a] font-medium">{t.ship}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/kayit"
              className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
              style={{
                background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}>
              Hemen Katıl, 500 Puan Kazan →
            </Link>
          </div>
        </div>
      </section>

      {/* Akademi Section */}
      <section className="bg-[#f8f6f3] border-t border-[#e5e0d8] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Öğren</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-2">Akademi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Kahve Çekirdeği Seçim Rehberi", cat: "Rehber" },
              { title: "Evde Mükemmel Filtre Kahve", cat: "Demleme" },
              { title: "Specialty Coffee Nedir?", cat: "Kahve Kültürü" },
            ].map((post) => (
              <Link key={post.title} href="/akademi"
                className="bg-white border border-[#e5e0d8] p-8 group hover:border-[#C4724B]/30 transition">
                <div className="w-8 h-px bg-[#D4A574]/40 mb-4" />
                <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">{post.cat}</span>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mt-2 group-hover:text-[#C4724B] transition">{post.title}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/akademi"
              className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
              style={{
                background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}>
              Tüm Yazılar →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
