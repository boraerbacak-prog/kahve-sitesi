import Link from "next/link";
import Image from "next/image";

const methods = [
  {
    emoji: "☕", title: "Filtre Kahve",
    slug: "filtre-kahve",
    desc: "Evde, ofiste veya tatilde taze ve güzel bir kahve yapmak artık sizin elinizde. Seçtiğiniz kahveyle birlikte uygulayacağınız teknik, öğütücünüz, suyun kalitesi, sıcaklığı, gramajı, süresi gibi süregelen uzun bir listemiz var.",
    image: "/ekipman/cam-kahve-demleme-400.jpg",
  },
  {
    emoji: "⚡", title: "Espresso",
    slug: "espresso",
    desc: "Yoğun ve konsantre bir kahve deneyimi. 9 bar basınçla hazırlanan espresso, birçok içeceğin temelidir.",
    image: "/ekipman/tamper.jpg",
  },
  {
    emoji: "🫖", title: "French Press",
    slug: "french-press",
    desc: "Dolgun gövdeli ve zengin tat profili sunar. Metal filtre sayesinde kahvenin doğal yağları korunur.",
    image: "/ekipman/french-press.jpg",
  },
  {
    emoji: "🫗", title: "Moka Pot",
    slug: "moka-pot",
    desc: "Ocak üstü espresso makinesi. İtalyan usulü güçlü ve yoğun bir kahve hazırlamak için idealdir.",
    image: "/ekipman/moka-pot.jpg",
  },
  {
    emoji: "💧", title: "Hario V60",
    slug: "hario-v60",
    desc: "Hafif ve aromatik bir fincan için ideal. Kağıt filtre kullanımı sayesinde temiz ve berrak bir kahve elde edersiniz.",
    image: "/ekipman/seramik-demleme-beyaz.jpg",
  },
  {
    emoji: "💨", title: "Aeropress",
    slug: "aeropress",
    desc: "Hızlı ve pratik demleme. Hava basıncı sayesinde kısa sürede temiz bir fincan elde edilir.",
    image: "/ekipman/sut-potu-350.jpg",
  },
  {
    emoji: "🥄", title: "Türk Kahvesi",
    slug: "turk-kahvesi",
    desc: "Geleneksel Türk kahvesi keyfi. İnce öğütülmüş kahve ile özel bir pişirme tekniği gerektirir.",
    image: "/ekipman/seramik-demleme-kirmizi.jpg",
  },
];

export default function DemlemePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Rehber</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Demleme Teknikleri</h1>
        <p className="text-[#4a4a4a] max-w-2xl mx-auto">
          Evde, ofiste veya tatilde taze ve güzel bir kahve yapmak artık sizin elinizde. Seçtiğiniz kahveyle birlikte uygulayacağınız teknik, öğütücünüz, suyun kalitesi, sıcaklığı, gramajı, süresi gibi süregelen uzun bir listemiz var. Merak etmeyin, istediğiniz sonucu elde etmeniz için birlikte adım adım ilerleyeceğiz. Şimdi yolumuza aşağıda yer alan beğendiğiniz tekniği seçerek başlayabiliriz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => (
          <Link
            key={method.title}
            href={`/demleme/${method.slug}`}
            className="group bg-white border border-[#e5e0d8] overflow-hidden hover:border-[#C4724B]/30 hover:shadow-lg transition-all"
          >
            <div className="relative h-48 bg-[#f8f6f3] overflow-hidden">
              <Image
                src={method.image}
                alt={method.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{method.title}</h2>
              <p className="text-[#4a4a4a] text-sm leading-relaxed">{method.desc}</p>
              <span className="inline-block mt-4 text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium group-hover:gap-2 transition-all">
                İncele →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
