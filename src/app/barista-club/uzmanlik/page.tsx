import Link from "next/link";

export default function UzmanlikPage() {
  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Barista Club</span>
          <h1 className="text-4xl font-bold text-white mt-3 mb-4">Uzmanlık</h1>
          <p className="text-[#a39080] max-w-xl mx-auto">Kahve bilgini katla, uzman seviyesine ulaş.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 mb-12">
        <div className="bg-white rounded-xl border border-amber-200 p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">📖 Kahve Akademisi</h2>
              <p className="text-sm text-body mb-4">
                Kahve çekirdeğinden fincana kadar her şey. Kavrum profilleri, demleme teknikleri, bölge rehberleri ve daha fazlası.
              </p>
              <Link href="/akademi"
                className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                Akademiye Git →
              </Link>
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">☕ Demleme Rehberi</h2>
              <p className="text-sm text-body mb-4">
                V60, Chemex, French Press, Moka Pot, Espresso — her demleme yöntemi için adım adım rehberler ve ipuçları.
              </p>
              <Link href="/demleme"
                className="inline-block border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                Demleme Rehberi →
              </Link>
            </div>
          </div>
          <div className="border-t border-amber-100 mt-8 pt-8">
            <h2 className="text-lg font-bold text-heading mb-4">📝 Blog</h2>
            <p className="text-sm text-body mb-4">
              Kahve dünyasından haberler, barista ipuçları, roaster notları ve daha fazlası için blogumuzu takip et.
            </p>
            <Link href="/blog"
              className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
              Blogu Keşfet →
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/barista-club" className="text-sm text-primary hover:underline">← Barista Club'a Dön</Link>
        </div>
      </div>
    </div>
  );
}
