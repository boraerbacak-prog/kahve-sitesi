import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, kgTo250g } from "@/lib/price";

function getProductImage(slug: string): string {
  const imageMap: Record<string, string> = {
    "ethiopia-sidamo-g2": "Gemini_Generated_Image_445e1s445e1s445e",
    "ethiopia-sidamo-g4": "Gemini_Generated_Image_c7t8k5c7t8k5c7t8",
    "ethiopia-lekempt-g4": "Gemini_Generated_Image_dvivc9dvivc9dviv",
    "guatemala-shb-18-sc": "Gemini_Generated_Image_g74yvng74yvng74y",
    "colombia-supremo-18-sc": "Gemini_Generated_Image_u229vnu229vnu229",
    "brasil-mogiana": "Gemini_Generated_Image_v621nbv621nbv621",
    "ethiopia-yirga-koke-honey-g1": "Gemini_Generated_Image_jwubysjwubysjwub",
    "colombia-la-roca-pink-bourbon": "Gemini_Generated_Image_vzulafvzulafvzul",
  };
  const key = imageMap[slug] || "rostello";
  return `/products/${key}.png`;
}

export default async function ProductsPage(props: { searchParams?: Promise<{ kat?: string }> }) {
  const searchParams = await props.searchParams;
  const kat = searchParams?.kat;

  const categories = await prisma.category.findMany({ orderBy: [{ name: "asc" }] });

  // Custom order: Espresso first, then rest
  const catOrder = ["Espresso", "Filtre Kahve", "Sporcu Kahvesi", "Türk Kahvesi"];
  const sortedCats = catOrder.map(name => categories.find(c => c.name === name)).filter(Boolean);

  const products = await prisma.product.findMany({
    where: { published: true, ...(kat ? { category: { slug: kat } } : {}) },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Section Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        <span className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase whitespace-nowrap bg-[#1a1a1a] text-white">
          Kahveler
        </span>
        <Link
          href="/ekipmanlar"
          className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap border border-[#C4724B] text-[#C4724B] hover:bg-[#C4724B] hover:text-white hover:-translate-y-0.5"
        >
          Ekipmanlar
        </Link>
        <Link
          href="/imza-urunler"
          className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap bg-[#C4724B] text-white hover:bg-[#B0603A] hover:-translate-y-0.5"
        >
          İmza Ürünler
        </Link>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex gap-2 mb-12 overflow-x-auto pb-2">
        <Link
          href="/urunler"
          className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap ${
            !kat ? "bg-[#1a1a1a] text-white" : "bg-white text-[#1a1a1a] border border-[#e5e0d8] hover:border-[#1a1a1a]"
          }`}
        >
          Tümü
        </Link>
        {sortedCats.map((cat) => (
          <Link
            key={cat.id}
            href={`/urunler?kat=${cat.slug}`}
            className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap ${
              kat === cat.slug
                ? "bg-[#1a1a1a] text-white"
                : "bg-white text-[#1a1a1a] border border-[#e5e0d8] hover:border-[#1a1a1a]"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#e5e0d8]">
        {products.map((product) => {
          const notes = product.flavorNotes ? JSON.parse(product.flavorNotes) : [];
          return (
            <div key={product.id} className="bg-white p-6 flex flex-col">
              <Link href={`/urunler/${product.slug}`} className="group">
                <div className="aspect-[4/5] bg-[#f8f6f3] mb-6 flex items-center justify-center overflow-hidden">
                  <Image
                    src={getProductImage(product.slug)}
                    alt={product.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-[#c8a77b] tracking-wider uppercase">
                      {product.origin || product.category.name}
                    </span>
                    {product.roastLevel && (
                      <span className="text-xs bg-[#f8f6f3] text-[#8c8c8c] px-2 py-1 uppercase tracking-wider">
                        {product.roastLevel === "light" ? "Hafif" : product.roastLevel === "medium" ? "Orta" : "Koyu"}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-[#1a1a1a] group-hover:text-[#c8a77b] transition">
                    {product.name}
                  </h3>
                  {notes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {notes.slice(0, 3).map((note: string) => (
                        <span key={note} className="text-xs bg-[#f8f6f3] text-[#6b4c3b] px-2 py-0.5 italic">{note}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e5e0d8]">
                <div>
                  <span className="text-lg font-bold text-[#1a1a1a]">{formatPrice(kgTo250g(product.price))} ₺</span>
                  <span className="text-xs text-[#8c8c8c]">/ 250g</span>
                  <p className="text-xs text-[#8c8c8c]">({formatPrice(product.price)} ₺/kg)</p>
                  <span className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock > 0 ? "Stokta" : "Tükendi"}
                  </span>
                </div>
                <Link href={`/urunler/${product.slug}`} className="text-xs font-medium text-[#C4724B] hover:text-[#B0603A] transition uppercase tracking-wider hover:-translate-y-0.5">
                  İncele →
                </Link>
              </div>
            </div>
          );
        })}
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
