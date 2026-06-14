import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function DeneyimPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Barista Club</span>
          <h1 className="text-4xl font-bold text-white mt-3 mb-4">Deneyim</h1>
          <p className="text-[#a39080] max-w-xl mx-auto">Sınırlı üretimler, özel davetler, unutulmaz kahve anıları.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 mb-12">
        <div className="bg-white rounded-xl border border-emerald-200 p-8 shadow-lg mb-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">🌟 Sınırlı Üretim Kahveler</h2>
              <p className="text-sm text-body mb-4">
                Dünyanın dört bir yanından seçtiğimiz mikro-lot kahveler. Her biri sınırlı sayıda, her biri benzersiz.
              </p>
              {session?.user ? (
                <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-xs font-medium">
                  Abonelere öncelikli erişim
                </span>
              ) : (
                <Link href="/kayit"
                  className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                  Katıl, Kaçırma
                </Link>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">🎪 Atölye & Etkinlikler</h2>
              <p className="text-sm text-body mb-4">
                Barista atölyeleri, cupping seansları ve kahve tadım etkinliklerine katıl. Kahve yolculuğunu paylaş.
              </p>
              <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-xs font-medium">
                Yakında
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#2c1810] rounded-xl p-8 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Özel Davetler</h2>
          <p className="text-[#a39080] max-w-xl mx-auto mb-6">
            Barista Club üyelerine özel düzenlenen cupping etkinlikleri, yeni ürün lansmanları ve özel tadım seanslarına katılma ayrıcalığı.
          </p>
          <Link href="/abonelik"
            className="inline-flex items-center gap-2 text-white px-8 py-3 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
            style={{
              background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
              backgroundSize: "200% auto",
              animation: "copper-shimmer 3s linear infinite",
            }}>
            Abone Ol, Ayrıcalıkları Yakala →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/barista-club" className="text-sm text-primary hover:underline">← Barista Club'a Dön</Link>
        </div>
      </div>
    </div>
  );
}
