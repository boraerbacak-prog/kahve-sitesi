import Link from "next/link";

export default function TeknolojiPage() {
  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Barista Club</span>
          <h1 className="text-4xl font-bold text-white mt-3 mb-4">Teknoloji</h1>
          <p className="text-[#a39080] max-w-xl mx-auto">Yapay zeka ve akıllı sistemlerle sana en uygun kahveyi bul.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 mb-12">
        <div className="bg-white rounded-xl border border-blue-200 p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">🤖 AI Barista</h2>
              <p className="text-sm text-body mb-4">
                Yapay zeka destekli kahve asistanımızla tanış. Damak tadına, ekipmanına ve ruh haline göre sana en uygun kahveyi önersin.
              </p>
              <Link href="/ai-barista"
                className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                Bana Kahve Öner →
              </Link>
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">🔍 Akıllı Filtreleme</h2>
              <p className="text-sm text-body mb-4">
                Lezzet notası, kavrum seviyesi, bölge ve daha birçok kritere göre kahveleri filtrele. Tam sana göre olanı bul.
              </p>
              <Link href="/urunler"
                className="inline-block border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                Kahveleri Keşfet →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/barista-club" className="text-sm text-primary hover:underline">← Barista Club'a Dön</Link>
        </div>
      </div>
    </div>
  );
}
