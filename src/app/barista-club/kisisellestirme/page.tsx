import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function KisisellestirmePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Barista Club</span>
          <h1 className="text-4xl font-bold text-white mt-3 mb-4">Kişiselleştirme</h1>
          <p className="text-[#a39080] max-w-xl mx-auto">Kahve profilin oluşsun, sana özel önerilerle tanış.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10 mb-12">
        <div className="bg-white rounded-xl border border-purple-200 p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">👤 Kahve Profilin</h2>
              <p className="text-sm text-body mb-4">
                Favori lezzet notaların, tercih ettiğin kavrum seviyesi ve demleme yöntemin kaydedilsin. Her ziyaretinde sana özel bir deneyim seni beklesin.
              </p>
              {session?.user ? (
                <Link href="/hesabim?tab=profile"
                  className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                  Profilimi Düzenle →
                </Link>
              ) : (
                <Link href="/giris"
                  className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                  Giriş Yap
                </Link>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">🎯 Damak Testi</h2>
              <p className="text-sm text-body mb-4">
                Henüz damak testini çözmediysen, kahve tercihlerini belirlemen için sana rehberlik edecek. AI Barista ile sohbet etmeye başla!
              </p>
              <Link href="/ai-barista"
                className="inline-block border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                Teste Başla →
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
