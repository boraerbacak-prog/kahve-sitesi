import Link from "next/link";

const equipment = [
  { emoji: "☕", title: "V60 Dripper", price: "350 ₺", desc: "Hario V60 seramik filtre kahve aparatı. Temiz ve aromatik kahve için ideal." },
  { emoji: "🫖", title: "French Press", price: "450 ₺", desc: "Cylinder French Press. Dolgun gövdeli kahve sevenler için klasik yöntem." },
  { emoji: "⚡", title: "Aeropress", price: "750 ₺", desc: "Hızlı ve pratik demleme için Aeropress Go. Seyahat dostu." },
  { emoji: "📊", title: "Dijital Terazi", price: "890 ₺", desc: "Hassas kahve terazisi. 0.1g duyarlılıkta ölçüm." },
  { emoji: "⚗️", title: "Su Isıtıcı (Kettle)", price: "1.290 ₺", desc: "Sıcaklık kontrollü elektrikli kettle. Pour over için ideal." },
  { emoji: "🔄", title: "El Değirmeni", price: "1.590 ₺", desc: "Seramik bilyalı el değirmeni. İstediğiniz incelikte öğütme." },
];

export default function EkipmanlarPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Ekipman</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Ekipmanlar</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Mükemmel kahve için ihtiyacınız olan her şey.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e0d8]">
        {equipment.map((item) => (
          <div key={item.title} className="bg-white p-8 flex flex-col">
            <div className="aspect-square bg-[#f8f6f3] mb-6 flex items-center justify-center border border-[#e5e0d8]">
              <span className="text-7xl">{item.emoji}</span>
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">{item.title}</h3>
            <p className="text-sm text-[#4a4a4a] leading-relaxed flex-1">{item.desc}</p>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e5e0d8]">
              <span className="text-lg font-bold text-[#1a1a1a]">{item.price}</span>
              <button className="text-xs font-medium text-[#C4724B] hover:text-[#B0603A] transition uppercase tracking-wider">
                İncele →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
