import Link from "next/link";

const methods = [
  {
    emoji: "☕", title: "V60 Pour Over",
    desc: "Hafif ve aromatik bir fincan için ideal. Kağıt filtre kullanımı sayesinde temiz ve berrak bir kahve elde edersiniz.",
    time: "2-3 dk", temp: "92-96°C", ratio: "1:15",
  },
  {
    emoji: "🫖", title: "French Press",
    desc: "Dolgun gövdeli ve zengin tat profili sunar. Metal filtre sayesinde kahvenin doğal yağları korunur.",
    time: "4 dk", temp: "93-96°C", ratio: "1:12",
  },
  {
    emoji: "⚡", title: "Espresso",
    desc: "Yoğun ve konsantre bir kahve deneyimi. 9 bar basınçla hazırlanan espresso, birçok içeceğin temelidir.",
    time: "25-30 sn", temp: "90-96°C", ratio: "1:2",
  },
  {
    emoji: "🧊", title: "Soğuk Demleme (Cold Brew)",
    desc: "Düşük asiditeli ve yumuşak bir soğuk kahve. Oda sıcaklığında 12-24 saat demlenir.",
    time: "12-24 saat", temp: "Soğuk", ratio: "1:8",
  },
  {
    emoji: "💧", title: "Aeropress",
    desc: "Hızlı ve pratik demleme. Hava basıncı sayesinde kısa sürede temiz bir fincan elde edilir.",
    time: "1-2 dk", temp: "85-90°C", ratio: "1:10",
  },
  {
    emoji: "☕", title: "Moka Pot",
    desc: "Ocak üstü espresso makinesi. İtalyan usulü güçlü ve yoğun bir kahve hazırlamak için idealdir.",
    time: "3-5 dk", temp: "~100°C", ratio: "1:7",
  },
];

export default function DemlemePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Rehber</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Demleme Yöntemleri</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Her damak tadına göre farklı bir demleme yöntemi vardır. Size en uygun olanı keşfedin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e0d8]">
        {methods.map((method) => (
          <div key={method.title} className="bg-white p-8 flex flex-col">
            <span className="text-5xl mb-6">{method.emoji}</span>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">{method.title}</h2>
            <p className="text-[#4a4a4a] text-sm leading-relaxed flex-1">{method.desc}</p>
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#e5e0d8]">
              <div className="text-center">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Süre</span>
                <span className="text-xs font-medium text-[#1a1a1a]">{method.time}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Sıcaklık</span>
                <span className="text-xs font-medium text-[#1a1a1a]">{method.temp}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Oran</span>
                <span className="text-xs font-medium text-[#1a1a1a]">{method.ratio}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
