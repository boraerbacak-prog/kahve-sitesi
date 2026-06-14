import Link from "next/link";

const phases = [
  {
    href: "/urunler?phase=resting",
    emoji: "🟤",
    title: "Dinlenme Evresi",
    desc: "Kavruma sonrası doğal gelişim süreci devam ediyor.",
    cta: "Dinlenme Fazındaki Ürünler",
    emojiHover: "group-hover:scale-110",
  },
  {
    href: "/urunler?phase=prepeak",
    emoji: "🌱",
    title: "Aroma Açanlar",
    desc: "Aromalar belirginleşmeye, tat profili şekillenmeye başlıyor.",
    cta: "Açılış Fazındaki Ürünler",
    emojiHover: "group-hover:scale-110",
  },
  {
    href: "/urunler?phase=peak",
    emoji: "✨",
    title: "Zirve",
    desc: "Kahvenin tüm karakterini en dengeli ve canlı haliyle sunduğu ideal içim zamanı.",
    cta: "Zirvedeki Ürünler",
    emojiHover: "group-hover:scale-110",
  },
  {
    href: "/urunler?phase=maturity",
    emoji: "🍂",
    title: "Yoğun & Gövdeli",
    desc: "Canlı aromalar yerini daha yumuşak, tatlı ve dengeli bir karaktere bırakıyor.",
    cta: "Olgun Profildeki Ürünler",
    emojiHover: "group-hover:scale-110",
  },
  {
    href: "/urunler?phase=coming_soon",
    emoji: "🔵",
    title: "Yakında",
    desc: "Yeni sezon hasatları, özel partiler ve beklenen çekirdekler işlenmeye devam ediyor. Her bir parti, kökeninden itibaren özenle takip ediliyor — doğru olgunluğa ulaştığında sizin için kavrulacak.",
    cta: "Yakında Gelecek Ürünler",
    emojiHover: "group-hover:scale-110",
  },
];

export default function RoastCalendar() {
  return (
    <section className="section-copper relative py-20 sm:py-28 bg-page">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading">
            Kavurma <span className="text-primary">Takvimi</span>
          </h2>
          <div className="text-sm text-body leading-relaxed space-y-4 text-left">
            <p><strong className="text-heading">Neden Kavrum Takvimi Var?</strong></p>
            <p>Nitelikli kahve, kavrulduğu gün en iyi hâlinde değildir. Kavrumdan sonra çekirdekler doğal olarak dinlenir ve zamanla gerçek karakterini ortaya çıkarır.</p>
            <p>Bu süreçte aromalar berraklaşır, tatlar dengelenir ve kahvenin kendine özgü notaları daha belirgin hale gelir. Çok erken demlenen kahveler potansiyelini tam yansıtamazken, doğru zamanda demlenen kahveler çok daha zengin ve dengeli bir fincan sunar.</p>
            <p>Rostello Dinamik Kavrum Takvimi, her kahvenin kökeni, rakımı, işleme yöntemi ve kavrum profilini dikkate alarak ideal içim dönemini belirler.</p>
            <p>Biz zamanlamayı sizin için takip ediyoruz; size sadece kahvenizin en iyi halinin keyfini çıkarmak kalıyor.</p>
          </div>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {phases.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="snap-start shrink-0 w-[75vw] sm:w-auto group relative flex flex-col p-5 border border-border bg-white overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(196,114,75,0.06), rgba(196,114,75,0.03), transparent)",
                  backgroundSize: "200% auto",
                  animation: "copper-shimmer 3s linear infinite",
                }}
              />
              <span className="absolute inset-x-0 top-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className={`relative text-xl mb-2 block transition-transform duration-500 ${p.emojiHover}`}>{p.emoji}</span>
              <h3 className="relative text-xs font-bold text-heading group-hover:text-primary transition-colors duration-500">{p.title}</h3>
              <p className="relative text-[10px] text-muted leading-relaxed mt-1 flex-1">{p.desc}</p>
              <span className="relative text-[10px] font-medium text-primary/80 group-hover:text-primary mt-3 flex items-center gap-1 group-hover:gap-2 transition-all duration-500">
                {p.cta} <span className="text-xs transition-transform duration-500 group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted/60 mt-10 max-w-lg mx-auto leading-relaxed">
          Kavurma tarihleri her gün otomatik olarak güncellenir. Kahvenizin üzerindeki rozet, çekirdeğin ideal içim dönemine ulaştığını gösterir. Zirve dönemindeki kahveleri keşfedebilir ve her çekirdeğin karakterini en canlı, en dengeli haliyle deneyimleyebilirsiniz.
        </p>
      </div>
    </section>
  );
}
