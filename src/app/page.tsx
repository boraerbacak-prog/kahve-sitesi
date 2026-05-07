import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { published: true, featured: true },
    include: { category: true },
    take: 4,
  });

  return (
    <div>
      <section className="relative bg-[#1a1a1a] text-white min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☕</text></svg>')] opacity-5 bg-repeat" />
        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-6">
              <Image src="/logo.png" alt="Logo" width={60} height={60} className="rounded-full" />
              <span className="text-sm tracking-[0.2em] uppercase text-[#c8a77b] font-medium">Specialty Coffee</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Özel Kahve<br />
              <span className="text-[#c8a77b]">Deneyimi</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-md leading-relaxed">
              En taze çekirdekler, özenle kavrulur. Her fincanda mükemmel lezzet.
            </p>
            <div className="flex gap-4">
              <Link
                href="/urunler"
                className="bg-[#c8a77b] hover:bg-[#b8956a] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
              >
                Alışverişe Başla
              </Link>
              <Link
                href="/ai-barista"
                className="border border-white/20 hover:border-white/40 text-white/80 px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
              >
                AI Barista
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">Seçkin Lezzetler</span>
            <h2 className="text-3xl font-bold text-[#1a1a1a] mt-2">Öne Çıkan Kahveler</h2>
          </div>
          <Link href="/urunler" className="text-sm font-medium text-[#1a1a1a] hover:text-[#c8a77b] transition border-b border-[#1a1a1a] hover:border-[#c8a77b] pb-0.5">
            Tümünü Gör →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e5e0d8]">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/urunler/${product.slug}`}
              className="group bg-white p-6 flex flex-col"
            >
              <div className="aspect-[4/5] bg-[#f8f6f3] mb-6 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#f8f6f3] to-[#ede8e0]">
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-500">☕</span>
                </div>
              </div>
              <div className="flex-1">
                <span className="text-xs text-[#c8a77b] tracking-wider uppercase">{product.category.name}</span>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mt-1 group-hover:text-[#c8a77b] transition">
                  {product.name}
                </h3>
                {product.origin && (
                  <p className="text-sm text-[#8c8c8c] mt-1">{product.origin}</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e5e0d8]">
                <span className="text-lg font-bold text-[#1a1a1a]">{product.price.toFixed(2)} ₺</span>
                <span className="text-xs text-[#1a1a1a] group-hover:text-[#c8a77b] transition font-medium uppercase tracking-wider">
                  İncele →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#1a1a1a] text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c8a77b]/10 flex items-center justify-center text-2xl">
                🫘
              </div>
              <h3 className="text-lg font-semibold mb-3">Seçkin Çekirdekler</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Dünyanın en iyi kahve bölgelerinden özenle seçilmiş çekirdekler
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c8a77b]/10 flex items-center justify-center text-2xl">
                🔥
              </div>
              <h3 className="text-lg font-semibold mb-3">Usta Kavrum</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Her çekirdeğe özel kavrum profili ile maksimum lezzet
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c8a77b]/10 flex items-center justify-center text-2xl">
                🚚
              </div>
              <h3 className="text-lg font-semibold mb-3">Taze Teslimat</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Sipariş üzerine kavrulur, en taze halde kapınıza gelir
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">AI Teknoloji</span>
            <h2 className="text-3xl font-bold text-[#1a1a1a] mt-3 mb-6">
              AI Barista ile<br />Tanışın
            </h2>
            <p className="text-[#8c8c8c] leading-relaxed mb-8">
              Hangi kahveyi seçeceğinize karar veremiyor musunuz? AI Baristamıza damak tadınızı anlatın, size en uygun kahveyi önersin.
            </p>
            <Link
              href="/ai-barista"
              className="inline-block bg-[#1a1a1a] hover:bg-[#333] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
            >
              AI Barista ile Konuş
            </Link>
          </div>
          <div className="bg-[#ede8e0] aspect-square flex items-center justify-center">
            <span className="text-9xl">🤖☕</span>
          </div>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
                <span className="text-lg font-bold">Rostello</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Özel kahve çekirdekleri, usta ellerde kavrulur.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#c8a77b]">Alışveriş</h4>
              <div className="flex flex-col gap-3">
                <Link href="/urunler" className="text-sm text-white/60 hover:text-white transition">Tüm Kahveler</Link>
                <Link href="/urunler?kategori=tek-koken" className="text-sm text-white/60 hover:text-white transition">Tek Köken</Link>
                <Link href="/urunler?kategori=espresso-blend" className="text-sm text-white/60 hover:text-white transition">Espresso</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#c8a77b]">Keşfet</h4>
              <div className="flex flex-col gap-3">
                <Link href="/hikaye" className="text-sm text-white/60 hover:text-white transition">Hikayemiz</Link>
                <Link href="/ai-barista" className="text-sm text-white/60 hover:text-white transition">AI Barista</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#c8a77b]">İletişim</h4>
              <div className="flex flex-col gap-3 text-sm text-white/60">
                <p>info@kahveci.com</p>
                <div className="flex gap-4 mt-2">
                  <a href="#" className="hover:text-[#c8a77b] transition">Instagram</a>
                  <a href="#" className="hover:text-[#c8a77b] transition">Twitter</a>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-white/30 mt-8">
            © 2025 Rostello. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
