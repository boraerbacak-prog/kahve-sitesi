import Link from "next/link";

const methods = [
  {
    emoji: "☕", title: "Filtre Kahve",
    slug: "filtre-kahve",
    desc: "Evde, ofiste veya tatilde taze ve güzel bir kahve yapmak artık sizin elinizde. Seçtiğiniz kahveyle birlikte uygulayacağınız teknik, öğütücünüz, suyun kalitesi, sıcaklığı, gramajı, süresi gibi süregelen uzun bir listemiz var.",
  },
  {
    emoji: "⚡", title: "Espresso",
    slug: "espresso",
    desc: "Yoğun ve konsantre bir kahve deneyimi. 9 bar basınçla hazırlanan espresso, birçok içeceğin temelidir.",
  },
  {
    emoji: "🫖", title: "French Press",
    slug: "french-press",
    desc: "Dolgun gövdeli ve zengin tat profili sunar. Metal filtre sayesinde kahvenin doğal yağları korunur.",
  },
  {
    emoji: "🫗", title: "Moka Pot",
    slug: "moka-pot",
    desc: "Ocak üstü espresso makinesi. İtalyan usulü güçlü ve yoğun bir kahve hazırlamak için idealdir.",
  },
  {
    emoji: "💧", title: "Hario V60",
    slug: "hario-v60",
    desc: "Hafif ve aromatik bir fincan için ideal. Kağıt filtre kullanımı sayesinde temiz ve berrak bir kahve elde edersiniz.",
  },
  {
    emoji: "💨", title: "Aeropress",
    slug: "aeropress",
    desc: "Hızlı ve pratik demleme. Hava basıncı sayesinde kısa sürede temiz bir fincan elde edilir.",
  },
  {
    emoji: "🥄", title: "Türk Kahvesi",
    slug: "turk-kahvesi",
    desc: "Geleneksel Türk kahvesi keyfi. İnce öğütülmüş kahve ile özel bir pişirme tekniği gerektirir.",
  },
];

export default function DemlemePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Rehber</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Demleme Teknikleri</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Evde, ofiste veya tatilde taze ve güzel bir kahve yapmak artık sizin elinizde. Şimdi yolumuza beğendiğiniz tekniği seçerek başlayabiliriz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e0d8]">
        {methods.map((method) => (
          <Link
            key={method.title}
            href={`/demleme/${method.slug}`}
            className="bg-white p-8 flex flex-col hover:bg-[#f8f6f3] transition"
          >
            <span className="text-5xl mb-6">{method.emoji}</span>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">{method.title}</h2>
            <p className="text-[#4a4a4a] text-sm leading-relaxed flex-1">{method.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
