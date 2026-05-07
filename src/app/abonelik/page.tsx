import Link from "next/link";

const plans = [
  {
    name: "Başlangıç", emoji: "🌱", price: "199",
    desc: "Ayda 1 paket taze kahve. Yeni tatlar keşfetmek isteyenler için ideal.",
    features: ["1 paket (250g)", "Her ay farklı çekirdek", "Ücretsiz kargo", "Dilediğin zaman iptal"],
  },
  {
    name: "Keyif", emoji: "☕", price: "379",
    desc: "Ayda 2 paket. Düzenli kahve tüketenler için en popüler seçenek.",
    features: ["2 paket (250g x2)", "Her ay farklı çekirdek", "Ücretsiz kargo", "Dilediğin zaman iptal", "Özel indirim"],
    popular: true,
  },
  {
    name: "Gurme", emoji: "🏆", price: "549",
    desc: "Ayda 3 paket. Gerçek kahve tutkunları için özel seçki.",
    features: ["3 paket (250g x3)", "Specialty seçkiler", "Ücretsiz kargo", "Dilediğin zaman iptal", "Özel indirim", "Öncelikli destek"],
  },
];

export default function AbonelikPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Abonelik</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Kahve Aboneliği</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Her ay taze kavrulmuş kahveler kapınızda. İstediğiniz zaman iptal edin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e5e0d8] max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white p-8 flex flex-col relative ${plan.popular ? "ring-2 ring-[#C4724B]" : ""}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C4724B] text-white text-[10px] tracking-wider uppercase px-4 py-1 font-medium">
                En Popüler
              </span>
            )}
            <span className="text-4xl mb-4">{plan.emoji}</span>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{plan.name}</h2>
            <p className="text-sm text-[#4a4a4a] mb-6 flex-1">{plan.desc}</p>
            <div className="mb-8">
              <span className="text-3xl font-bold text-[#1a1a1a]">{plan.price} ₺</span>
              <span className="text-sm text-[#8c8c8c]"> / ay</span>
            </div>
            <ul className="mb-8 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-[#4a4a4a] flex items-start gap-2">
                  <span className="text-[#C4724B] mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white py-4 text-sm font-medium tracking-wide uppercase transition mt-auto">
              Abone Ol
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
