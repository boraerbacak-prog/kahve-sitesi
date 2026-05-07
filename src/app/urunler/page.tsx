import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    include: { category: true },
  });

  const categories = await prisma.category.findMany();

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">Koleksiyon</span>
        <h1 className="text-4xl font-bold text-[#1a1a1a] mt-2">Tüm Kahveler</h1>
      </div>

      <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
        <Link
          href="/urunler"
          className="px-5 py-2.5 bg-[#1a1a1a] text-white text-xs font-medium tracking-wider uppercase"
        >
          Tümü
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/urunler?kategori=${cat.slug}`}
            className="px-5 py-2.5 bg-white text-[#1a1a1a] text-xs font-medium tracking-wider uppercase border border-[#e5e0d8] hover:border-[#1a1a1a] transition whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#e5e0d8]">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/urunler/${product.slug}`}
            className="group bg-white p-6 flex flex-col"
          >
            <div className="aspect-[4/5] bg-[#f8f6f3] mb-6 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#f8f6f3] to-[#ede8e0]">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-500">☕</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-[#c8a77b] tracking-wider uppercase">{product.category.name}</span>
                {product.roastLevel && (
                  <span className="text-[10px] bg-[#f8f6f3] text-[#8c8c8c] px-2 py-1 uppercase tracking-wider">
                    {product.roastLevel === "light" ? "Hafif" : product.roastLevel === "medium" ? "Orta" : "Koyu"}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-[#1a1a1a] group-hover:text-[#c8a77b] transition">
                {product.name}
              </h3>
              <p className="text-sm text-[#8c8c8c] mt-1">{product.origin || product.category.name}</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e5e0d8]">
              <div>
                <span className="text-lg font-bold text-[#1a1a1a]">{product.price.toFixed(2)} ₺</span>
                {product.compareAt && product.compareAt > product.price && (
                  <span className="text-sm text-[#8c8c8c] line-through ml-2">{product.compareAt.toFixed(2)} ₺</span>
                )}
              </div>
              <span className="text-xs text-[#1a1a1a] group-hover:text-[#c8a77b] transition font-medium uppercase tracking-wider">
                İncele →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-24 text-[#8c8c8c]">
          <p className="text-lg mb-2">Henüz ürün eklenmemiş.</p>
          <p className="text-sm">Admin panelinden ürünleri ekleyebilirsiniz.</p>
        </div>
      )}
    </div>
  );
}
