import Link from "next/link";

const signatures = [
  { emoji: "🔥", title: "Rostello Signature Blend", desc: "Brezilya, Guatemala ve Etiyopya çekirdeklerinin özel harmanı. Yıl boyu sabit lezzet.", price: "380 ₺", cat: "Harman" },
  { emoji: "🌙", title: "Gece Kavrum", desc: "Koyu kavrulmuş, yoğun gövdeli. Espresso ve sütlü içecekler için ideal.", price: "350 ₺", cat: "Koyu Kavrum" },
  { emoji: "🌸", title: "Çiçeksi Notalar", desc: "Etiyopya tek köken. Yasemin, bergamot ve limon notalarıyla zarif bir fincan.", price: "420 ₺", cat: "Tek Köken" },
  { emoji: "🍫", title: "Çikolata Sevenler İçin", desc: "Guatemala ve Kolombiya harmanı. Sütlü çikolata ve karamel notaları.", price: "360 ₺", cat: "Harman" },
  { emoji: "🏆", title: "Barista Seçkisi", desc: "Sınırlı üretim özel partiler. Her ay değişen premium seçki.", price: "550 ₺", cat: "Specialty" },
  { emoji: "🎯", title: "Perfect Morning", desc: "Hafif kavrulmuş, yumuşak asiditeli. Güne başlarken ideal filtre kahve.", price: "340 ₺", cat: "Filtre" },
];

export default function ImzaUrunlerPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Seçki</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">İmza Ürünler</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Rostello'nun özel olarak hazırladığı imza ürünler.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e0d8]">
        {signatures.map((item) => (
          <div key={item.title} className="bg-white p-8 flex flex-col">
            <div className="aspect-[4/3] bg-[#f8f6f3] mb-6 flex items-center justify-center border border-[#e5e0d8]">
              <span className="text-7xl">{item.emoji}</span>
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4724B] font-medium mb-1">{item.cat}</span>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.title}</h3>
            <p className="text-sm text-[#4a4a4a] leading-relaxed flex-1">{item.desc}</p>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e5e0d8]">
              <span className="text-lg font-bold text-[#1a1a1a]">{item.price}</span>
              <Link
                href="/urunler"
                className="text-xs font-medium text-[#C4724B] hover:text-[#B0603A] transition uppercase tracking-wider"
              >
                İncele →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
