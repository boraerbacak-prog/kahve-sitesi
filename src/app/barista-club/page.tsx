import Link from "next/link";
import { auth } from "@/lib/auth";

const pillars = [
  {
    slug: "teknoloji",
    title: "Teknoloji",
    desc: "Yapay zeka destekli kahve önerileri, akıllı filtreleme ve senin damak tadına göre kişiselleştirilmiş keşif.",
    icon: "⚡",
    color: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    slug: "kisisellestirme",
    title: "Kişiselleştirme",
    desc: "Kendi kahve profilin, tercihlerin, favori lezzet notaların ve sana özel ürün önerileri.",
    icon: "🎯",
    color: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    slug: "uzmanlik",
    title: "Uzmanlık",
    desc: "Kahve akademisi, demleme rehberleri, barista ipuçları ve uzman içerikleriyle kahve bilgini katla.",
    icon: "📚",
    color: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    slug: "ritueller",
    title: "Ritüel",
    desc: "Kendine özel kahve rutinin oluştur, demleme günlüğü tut, her fincanı bir ritüele dönüştür.",
    icon: "🕯️",
    color: "from-rose-500/10 to-rose-600/5",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
  },
  {
    slug: "deneyim",
    title: "Deneyim",
    desc: "Sınırlı üretim kahvelere öncelikli erişim, özel davetler ve barista atölyelerine katılım.",
    icon: "🌟",
    color: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
];

export default async function BaristaClubPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-light/5" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Rostello</span>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">Barista Club</h1>
          <p className="text-[#a39080] max-w-2xl mx-auto">
            Kahve yolculuğunu bir üst seviyeye taşı. Teknoloji, kişiselleştirme, uzmanlık, ritüel ve deneyim — beş pilondan oluşan kahve kulübüne katıl.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-10">
        {session?.user ? (
          <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-lg mb-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800">
                  Hoş geldin, <strong className="text-amber-900">{session.user.name || "Kahvesever"}</strong>! Barista Club üyeliğin aktif.
                </p>
                <p className="text-xs text-amber-600 mt-1">Tüm pilleri keşfet ve kahve deneyimini kişiselleştir.</p>
              </div>
              <Link href="/sadakat" className="text-xs text-primary hover:underline">Çekirdek Kredi →</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-lg mb-10 text-center">
            <p className="text-amber-800 mb-3">Barista Club'a katılmak için giriş yap.</p>
            <Link href="/kayit" className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg text-sm font-medium transition">
              Ücretsiz Katıl
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pillars.map((p) => (
            <Link key={p.slug} href={`/barista-club/${p.slug}`}
              className={`group bg-white rounded-xl border ${p.border} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${p.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <span className="text-3xl block mb-3">{p.icon}</span>
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${p.badge} mb-2`}>{p.title}</span>
                <p className="text-sm text-gray-600 mt-2">{p.desc}</p>
                <span className="inline-block text-xs text-primary font-medium mt-4 group-hover:translate-x-1 transition-transform">
                  Keşfet →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-[#2c1810] rounded-xl p-8 md:p-12 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Abone Ol, Tam Üye Ol</h2>
          <p className="text-[#a39080] max-w-2xl mx-auto mb-6">
            Abone olduğunda Barista Club'ın tüm avantajlarına anında erişirsin. Altın üye olur, ekipman ve imza ürünlerde %10 indirim kazanırsın.
          </p>
          <Link href="/abonelik"
            className="inline-flex items-center gap-2 text-white px-10 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
            style={{
              background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
              backgroundSize: "200% auto",
              animation: "copper-shimmer 3s linear infinite",
            }}>
            Abonelik Paketlerini İncele →
          </Link>
        </div>
      </div>
    </div>
  );
}
