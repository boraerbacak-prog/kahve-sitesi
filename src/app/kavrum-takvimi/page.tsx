import Link from "next/link";
import Image from "next/image";

const phases = [
  {
    slug: "resting",
    emoji: "🟤",
    title: "Dinlenme Evresi",
    subtitle: "Kavrum Sonrasi Bekleme",
    desc: "Kavrumdan hemen sonra çekirdeklerin içinde gaz birikimi devam eder. Bu dönemde kahve henüz oturmamıştır. Asidite yüksek, tat profili dağınıktır. Çekirdekler nefes almaya devam eder ve iç yapıları stabilize olur.",
    duration: "3-7 gün",
    taste: "Yüksek asidite, dengesiz, henuz oturmamis",
    bestFor: "Acelye kavrulmamis kahveleri sevenler",
    cta: "Dinlenme Fazindaki Ürunler",
  },
  {
    slug: "prepeak",
    emoji: "🌱",
    title: "Aroma Açanlar",
    subtitle: "Karakterin Ortaya Çikisi",
    desc: "Kavrumun ilk şok etkisi geçer, çekirdekler içindeki CO₂ miktarı azalmaya başlar. Aromatik bileşenler yüzeye çıkar ve tat profili netleşmeye başlar. Çiçeksi ve meyvemsi notalar belirginleşir.",
    duration: "7-14 gün",
    taste: "Canli asidite, belirgin aroma, berraklasma",
    bestFor: "Filtre kahve sevenler, tek koken meraklilari",
    cta: "Aciliş Fazindaki Ürunler",
  },
  {
    slug: "peak",
    emoji: "✨",
    title: "Zirve",
    subtitle: "Ideal Içim Dönemi",
    desc: "Kahvenin tüm karakterini en dengeli ve canlı haliyle sunduğu dönemdir. Asidite, tatlılık, gövde ve aroma arasındaki denge en üst seviyededir. Her çekirdeğin zirve dönemi farklıdır; köken, işleme ve kavrum profiline göre değişir.",
    duration: "14-28 gün",
    taste: "Dengeli, zengin, tam karakter",
    bestFor: "En iyi fincan deneyimini arayan herkes",
    cta: "Zirvedeki Ürunler",
  },
  {
    slug: "maturity",
    emoji: "🍂",
    title: "Yoğun & Gövdeli",
    subtitle: "Olgunlaşma Dönemi",
    desc: "Zirve dönemi geçtikten sonra canlı asidite yerini daha yumuşak, tatlı ve dengeli bir karaktere bırakır. Çekirdeklerin iç yapısı tamamen oturmuştur. Bu dönem özellikle espresso sevenler için idealdir.",
    duration: "28-45 gün",
    taste: "Dusuk asidite, tatli, yumusak, dolgun govde",
    bestFor: "Espresso sevenler, geleneksel tatlar",
    cta: "Olgun Profildeki Ürunler",
  },
  {
    slug: "coming_soon",
    emoji: "🔵",
    title: "Yakinda",
    subtitle: "Yeni Sezon Hasatlari",
    desc: "Henüz kavrulmamış veya ideal içim dönemine ulaşmamış çekirdekler. Yeni sezon hasatları, özel partiler ve beklenen çekirdekler işlenmeye devam ediyor. Her bir parti, kökeninden itibaren özenle takip ediliyor.",
    duration: "Değişken",
    taste: "Henuz belirlenmedi",
    bestFor: "Yeni lezzetleri kesfetmek isteyenler",
    cta: "Yakinda Gelecek Ürunler",
  },
];

const faq = [
  {
    q: "Kavrum takvimi neden önemli?",
    a: "Nitelikli kahve, kavrulduğu gün en iyi halinde değildir. Kavrumdan sonra çekirdeklerde devam eden kimyasal süreçler, aromaların oturması ve dengelenmesi için zamana ihtiyaç duyar. Doğru zamanda demlenen kahve, potansiyelini tam olarak yansıtır.",
  },
  {
    q: "Zirve dönemi her kahvede aynı mı?",
    a: "Hayır. Her çekirdeğin zirve dönemi; kökeni, rakımı, işleme yöntemi ve kavrum profiline göre farklılık gösterir. Dinamik Kavrum Takvimimiz bu parametrelerin tamamını dikkate alarak her çekirdek için ideal içim dönemini ayrı ayrı belirler.",
  },
  {
    q: "Kahvemi zirve döneminde nasıl anlarım?",
    a: "Her ürünün üzerindeki rozet, o çekirdeğin güncel içim dönemini gösterir. Ayrıca ürün detay sayfasında kavrum takvimi görseliyle hangi aşamada olduğunu net olarak görebilirsiniz.",
  },
  {
    q: "Zirve dışındaki dönemlerde kahve içilmez mi?",
    a: "Elbette içilir. Her dönem farklı bir karakter sunar. Kimi kahvesini dinlenme evresinde daha canlı ve asiditeli severken, kimi olgun dönemde daha yumuşak ve tatlı tercih eder. Kavrum Takvimi bir uyarı değil, bir rehberdir.",
  },
  {
    q: "Kahvemi nasıl saklamalıyım?",
    a: "Serin, karanlık ve kuru bir yerde, hava geçirmez bir kapta saklayın. Buzdolabı veya derin dondurucu önermiyoruz — nem ve sıcaklık dalgalanmaları çekirdeğin aromalarına zarar verir. Kavrulmuş kahvenizi 2-3 ay içinde tüketmenizi öneririz.",
  },
];

export default function KavrumTakvimiPage() {
  return (
    <div>
      <section className="section-copper relative bg-heading py-32 sm:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10" />
        <div className="absolute inset-0 opacity-10">
          <Image src="/celsus/demleme/demleme2.png" alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <div className="relative z-20 max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary-light font-medium">Rostello</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6 leading-tight">
            Kavrum <span className="text-primary">Takvimi</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            Her çekirdeğin kendine özgü bir zamanı vardır. Dinamik Kavrum Takvimimizle kahvenizin
            ideal içim dönemini takip edin, her fincanda en dengeli hali deneyimleyin.
          </p>
        </div>
      </section>

      <section className="section-copper bg-page py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="eyebrow">Kavrum Süreci</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
              Çekirdeğin Yolculuğu
            </h2>
            <p className="text-body text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Her çekirdek, kavrulduğu andan itibaren bir dönüşüm sürecine girer.
              Dinamik Kavrum Takvimimiz, bu yolculuğu adım adım takip eder.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-16">
            {phases.map((p, i) => (
              <Link
                key={p.slug}
                href={`/urunler?phase=${p.slug}`}
                className="section-copper group relative flex flex-col bg-card border border-border p-6 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <span className="text-2xl mb-3 block">{p.emoji}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                  Evre {i + 1}
                </span>
                <h3 className="text-sm font-bold text-heading group-hover:text-primary transition-colors mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed flex-1">{p.subtitle}</p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <span className="text-[10px] text-body/60">{p.duration}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/urunler"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-white transition-all duration-300"
            >
              Tüm Ürünleri Keşfet →
            </Link>
          </div>
        </div>
      </section>

      <section className="section-copper bg-card/50 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="eyebrow">Detayli İncele</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
              Her Evrenin <span className="animate-copper">Karakteri</span>
            </h2>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {phases.map((p, i) => (
              <details key={p.slug} className="group bg-card border border-border overflow-hidden transition-all duration-300 open:border-primary/30">
                <summary className="flex items-center gap-4 p-5 cursor-pointer list-none hover:bg-page-hover transition-colors">
                  <span className="text-xl shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Evre {i + 1}</span>
                    <h3 className="text-base font-bold text-heading group-open:text-primary transition-colors">{p.title}</h3>
                  </div>
                  <span className="text-xs text-muted shrink-0">{p.duration}</span>
                  <svg className="w-4 h-4 text-muted shrink-0 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-border/50">
                  <p className="text-sm text-body leading-relaxed mb-4">{p.desc}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-heading">Tat Profili:</span>
                      <p className="text-muted mt-0.5">{p.taste}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-heading">Ideal:</span>
                      <p className="text-muted mt-0.5">{p.bestFor}</p>
                    </div>
                  </div>
                  <Link
                    href={`/urunler?phase=${p.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mt-4 hover:opacity-80 transition"
                  >
                    {p.cta} →
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-copper bg-page py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="eyebrow">Bilgi</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
              Sikça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="group bg-card border border-border overflow-hidden transition-all duration-300 open:border-primary/30">
                <summary className="flex items-center gap-4 p-5 cursor-pointer list-none hover:bg-page-hover transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-heading group-open:text-primary transition-colors">{item.q}</h3>
                  </div>
                  <svg className="w-4 h-4 text-muted shrink-0 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-border/50">
                  <p className="text-sm text-body leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-copper bg-heading py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary-light font-medium">Hazir Misin?</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Kahveni Zirvede <span className="text-primary">Dene</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Zirve dönemindeki çekirdeklerimizi keşfet, her fincanda en dengeli hali deneyimle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/urunler?phase=peak"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold tracking-wide uppercase bg-primary text-white px-8 py-4 hover:bg-primary-hover transition-all duration-300"
            >
              Zirvedeki Ürünler →
            </Link>
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold tracking-wide uppercase text-white border border-white/30 px-8 py-4 hover:bg-white/10 transition-all duration-300"
            >
              Tüm Ürünler
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
