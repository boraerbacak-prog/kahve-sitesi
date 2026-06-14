import Link from "next/link";

export default function RituellerPage() {
  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Barista Club</span>
          <h1 className="text-4xl font-bold text-white mt-3 mb-4">Ritüel</h1>
          <p className="text-[#a39080] max-w-xl mx-auto">Her fincan kahve bir ritüel. Kendi ritüelini oluştur.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 mb-12">
        <div className="bg-white rounded-xl border border-rose-200 p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">🕯️ Sabah Ritüeli</h2>
              <p className="text-sm text-body mb-4">
                Güne başlarken ilk fincanını özel kıl. Doğru çekirdek, doğru demleme ve sessiz bir an — kahve içmekten öte bir deneyim.
              </p>
              <div className="bg-rose-50 rounded-lg p-4 text-sm text-rose-800">
                <strong>Yakında:</strong> Kahve günlüğü, hatırlatıcılar, kişisel demleme istatistiklerin.
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">📋 Demleme Günlüğü</h2>
              <p className="text-sm text-body mb-4">
                Hangi kahveyi hangi yöntemle, hangi öğütümde ve su sıcaklığında demlediğini not et. Kendi mükemmel tarifini bul.
              </p>
              <Link href="/demleme"
                className="inline-block border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                Demleme Teknikleri →
              </Link>
            </div>
          </div>
          <div className="border-t border-rose-100 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500 italic">
              &ldquo;Kahve bir içecekten çok daha fazlasıdır — bir ritüel, bir mola, bir an.&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/barista-club" className="text-sm text-primary hover:underline">← Barista Club'a Dön</Link>
        </div>
      </div>
    </div>
  );
}
