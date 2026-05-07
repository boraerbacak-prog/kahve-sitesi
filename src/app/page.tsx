import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Hero - Dijital Barista */}
      <section className="relative min-h-[90vh] bg-[#1a1a1a] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C4724B]/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[#C4724B]/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-[#C4724B]/3 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image src="/logo.png" alt="Rostello" width={48} height={48} className="rounded-full" />
                <span className="text-sm tracking-[0.2em] uppercase text-[#C4724B] font-medium">Dijital Barista</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                Kahvenizi
                <br />
                <span className="animate-copper">Yapay Zeka</span>
                <br />
                ile Keşfedin
              </h1>
              <p className="text-lg text-white/60 mb-10 max-w-md leading-relaxed">
                Rostello Dijital Barista, damak tadınıza en uygun kahveyi bulmanız için size rehberlik eder. 
                Bir kahve sever olarak yolculuğunuzda yapay zeka destekli kişisel baristanız.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/ai-barista"
                  className="bg-[#C4724B] hover:bg-[#B0603A] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition inline-flex items-center gap-2"
                >
                  Barista ile Konuş
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/damak-testi"
                  className="border border-[#C4724B]/30 hover:border-[#C4724B]/60 text-white/80 hover:text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
                >
                  Damak Testi
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-96 h-96">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C4724B]/10 via-[#D4A574]/5 to-transparent animate-float" />
                <div className="absolute inset-8 rounded-full bg-[#1a1a1a] border border-[#C4724B]/20 flex items-center justify-center">
                  <Image src="/logo.png" alt="Rostello" width={160} height={160} className="rounded-full opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Damak Testi Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Keşif</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-3 mb-6 leading-tight">
              Damak Testi ile<br />
              <span className="text-[#C4724B]">Kahve Profilinizi</span> Oluşturun
            </h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-8">
              Birkaç soruyla damak tadınızı analiz ediyor, size özel kahve önerileri sunuyoruz. 
              Sevdiğiniz tat profillerini keşfedin ve kahve yolculuğunuzda bir sonraki adımı bulun.
            </p>
            <Link
              href="/damak-testi"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#C4724B] hover:text-[#B0603A] transition border-b border-[#C4724B] pb-0.5"
            >
              Teste Başla →
            </Link>
          </div>
          <div className="aspect-[4/3] bg-[#1a1a1a] flex items-center justify-center border border-[#C4724B]/10">
            <span className="text-8xl">👅</span>
          </div>
        </div>
      </section>

      {/* Demleme Teknikleri Section */}
      <section className="bg-[#1a1a1a] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Rehber</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">Demleme Yöntemleri</h2>
            <p className="text-white/50 max-w-md mx-auto">
              Doğru demleme tekniğiyle kahvenizden maksimum lezzeti alın.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: "☕", title: "V60 Pour Over", desc: "Hafif ve aromatik filtre kahve için ideal." },
              { emoji: "🫖", title: "French Press", desc: "Dolgun gövdeli, zengin tat profili." },
              { emoji: "⚡", title: "Espresso", desc: "Yoğun ve konsantre, her yudumda lezzet." },
              { emoji: "🧊", title: "Soğuk Demleme", desc: "Düşük asiditeli, yumuşak soğuk kahve." },
            ].map((method) => (
              <Link
                key={method.title}
                href="/demleme"
                className="bg-white/5 border border-white/10 p-8 text-center group hover:bg-white/[0.08] hover:border-[#C4724B]/30 transition"
              >
                <span className="text-5xl block mb-6 group-hover:scale-110 transition-transform">{method.emoji}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-sm text-white/50">{method.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/demleme"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#C4724B] hover:text-[#D4A574] transition border-b border-[#C4724B] pb-0.5"
            >
              Tüm Yöntemleri İncele →
            </Link>
          </div>
        </div>
      </section>

      {/* Abonelik Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/3] bg-[#f8f6f3] flex items-center justify-center border border-[#e5e0d8] order-2 lg:order-1">
            <span className="text-8xl">📦</span>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Abonelik</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-3 mb-6 leading-tight">
              Kahve Aboneliği ile<br />
              <span className="text-[#C4724B]">Farkı Keşfedin</span>
            </h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-8">
              Her ay kapınıza gelen taze kavrulmuş kahveler. Size özel hazırlanan abonelik paketlerimizle 
              kahve keyfinizi kesintisiz yaşayın. İstediğiniz zaman iptal edin.
            </p>
            <Link
              href="/abonelik"
              className="inline-flex items-center gap-2 bg-[#C4724B] hover:bg-[#B0603A] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
            >
              Abonelik Paketleri
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-[#f8f6f3] border-t border-[#e5e0d8] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Güncel</span>
              <h2 className="text-3xl font-bold text-[#1a1a1a] mt-2">Blog</h2>
            </div>
            <Link href="/blog" className="text-sm font-medium text-[#C4724B] hover:text-[#B0603A] transition border-b border-[#C4724B] pb-0.5">
              Tüm Yazılar →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Kahve Çekirdeği Seçim Rehberi", cat: "Rehber", emoji: "🫘" },
              { title: "Evde Mükemmel Filtre Kahve", cat: "Demleme", emoji: "☕" },
              { title: "Specialty Coffee Nedir?", cat: "Kahve Kültürü", emoji: "🏆" },
            ].map((post) => (
              <Link
                key={post.title}
                href="/blog"
                className="bg-white border border-[#e5e0d8] p-8 group hover:border-[#C4724B]/30 transition"
              >
                <span className="text-4xl block mb-4">{post.emoji}</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4724B] font-medium">{post.cat}</span>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mt-2 group-hover:text-[#C4724B] transition">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
                <span className="text-lg font-bold">Rostello</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Yapay zeka destekli dijital barista ile kahve keşfi.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#C4724B]">Kahve</h4>
              <div className="flex flex-col gap-2">
                <Link href="/urunler" className="text-sm text-white/50 hover:text-white transition">Tüm Kahveler</Link>
                <Link href="/imza-urunler" className="text-sm text-white/50 hover:text-white transition">İmza Ürünler</Link>
                <Link href="/ekipmanlar" className="text-sm text-white/50 hover:text-white transition">Ekipmanlar</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#C4724B]">Keşfet</h4>
              <div className="flex flex-col gap-2">
                <Link href="/ai-barista" className="text-sm text-white/50 hover:text-white transition">Dijital Barista</Link>
                <Link href="/damak-testi" className="text-sm text-white/50 hover:text-white transition">Damak Testi</Link>
                <Link href="/demleme" className="text-sm text-white/50 hover:text-white transition">Demleme Yöntemleri</Link>
                <Link href="/abonelik" className="text-sm text-white/50 hover:text-white transition">Abonelik</Link>
                <Link href="/blog" className="text-sm text-white/50 hover:text-white transition">Blog</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#C4724B]">Kurumsal</h4>
              <div className="flex flex-col gap-2">
                <Link href="/b2b" className="text-sm text-white/50 hover:text-white transition">B2B</Link>
                <Link href="/hikaye" className="text-sm text-white/50 hover:text-white transition">Hikayemiz</Link>
                <div className="flex gap-4 mt-2">
                  <a href="#" className="text-sm text-white/50 hover:text-[#C4724B] transition">Instagram</a>
                  <a href="#" className="text-sm text-white/50 hover:text-[#C4724B] transition">Twitter</a>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-white/20 mt-8">© 2025 Rostello. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
