import Link from "next/link";

export default function B2BPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Kurumsal</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">B2B Çözümler</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          İşletmeniz için özel kahve çözümleri. Perakende, toptan ve kurumsal abonelik.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e5e0d8] mb-12">
        {[
          { emoji: "🏪", title: "Perakende Tedarik", desc: "Kafe ve restoranlar için özel çekirdek seçkileri. Size özel kavrum profili ile fark yaratın." },
          { emoji: "📦", title: "Toptan Satış", desc: "Düzenli tedarik için özel fiyatlandırma. 5kg üzeri siparişlerde avantajlı fiyatlar." },
          { emoji: "☕", title: "Kurumsua Abonelik", desc: "Ofisiniz için düzenli kahve tedariki. Her ay taze kahve, ücretsiz kargo." },
          { emoji: "🎓", title: "Eğitim & Danışmanlık", desc: "Barista eğitimi, kahve atölyeleri ve menü danışmanlığı hizmetleri." },
        ].map((item) => (
          <div key={item.title} className="bg-white p-8">
            <span className="text-4xl block mb-4">{item.emoji}</span>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.title}</h3>
            <p className="text-sm text-[#4a4a4a] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">İş Birliği için Bize Ulaşın</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          İşletmenize özel çözümler için bizimle iletişime geçin.
        </p>
        <a
          href="mailto:info@rostello.com"
          className="inline-block bg-[#C4724B] hover:bg-[#B0603A] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
        >
          info@rostello.com
        </a>
      </div>
    </div>
  );
}
