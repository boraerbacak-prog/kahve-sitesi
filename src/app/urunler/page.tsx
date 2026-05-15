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

export default async function ProductsPage(props: {
  searchParams?: Promise<{ kategori?: string }>;
}) {
  const searchParams = await props.searchParams;
  const seg = searchParams?.kategori;

  const categories = await prisma.category.findMany();

  const products = await prisma.product.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: [{ segment: "asc" }, { name: "asc" }],
  });

  const filtered = seg
    ? products.filter((p) => p.category.slug === seg)
    : products;

  const grouped: Record<string, typeof products> = {};
  for (const p of filtered) {
    const key = p.segment || "diger";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  const segmentLabels: Record<string, string> = {
    standart: "Standart Çekirdek",
    specialty: "Specialty",
  };

  const segmentDescs: Record<string, string> = {
    standart: "Günlük kullanım için ideal, kaliteli standart çekirdekler.",
    specialty: "Nadir bulunan, üstün kalite notasına sahip özel çekirdekler.",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">Koleksiyon</span>
        <h1 className="text-4xl font-bold text-[#1a1a1a] mt-2">Tüm Kahveler</h1>
      </div>

      <div className="flex gap-3 mb-12 overflow-x-auto pb-2">
        <Link
          href="/urunler"
          className={`px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap ${
            !seg ? "bg-[#1a1a1a] text-white" : "bg-white text-[#1a1a1a] border border-[#e5e0d8] hover:border-[#1a1a1a]"
          }`}
        >
          Tümü
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/urunler?kategori=${cat.slug}`}
            className={`px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap ${
              seg === cat.slug
                ? "bg-[#1a1a1a] text-white"
                : "bg-white text-[#1a1a1a] border border-[#e5e0d8] hover:border-[#1a1a1a]"
            }`}
          >
            {cat.name}
          </Link>
        ))}
        <Link
          href="/imza-urunler"
          className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap bg-[#C4724B] text-white hover:bg-[#B0603A] hover:-translate-y-0.5"
        >
          İmza Ürünler
        </Link>
        <Link
          href="/ekipmanlar"
          className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap border border-[#C4724B] text-[#C4724B] hover:bg-[#C4724B] hover:text-white hover:-translate-y-0.5"
        >
          Ekipmanlar
        </Link>
      </div>

      {Object.entries(grouped).map(([segment, segProducts]) => (
        <div key={segment} className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">{segmentLabels[segment] || segment}</h2>
            <p className="text-[#8c8c8c] text-sm mt-1">{segmentDescs[segment]}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#e5e0d8]">
            {segProducts.map((product) => {
              const notes = product.flavorNotes ? JSON.parse(product.flavorNotes) : [];
              return (
                <div
                  key={product.id}
                  className="bg-white p-6 flex flex-col"
                >
                  <Link href={`/urunler/${product.slug}`} className="group">
                    <div className="aspect-[4/5] bg-[#f8f6f3] mb-6 flex items-center justify-center overflow-hidden relative">
                      <Image
                        src={getProductImage(product.slug)}
                        alt={product.name}
                        width={400}
                        height={500}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {product.stock > 0 ? (
                        <span className="absolute top-2 right-2 text-[10px] bg-green-600 text-white px-2 py-0.5 uppercase tracking-wider font-medium">
                          Stokta
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 text-[10px] bg-red-600 text-white px-2 py-0.5 uppercase tracking-wider font-medium">
                          Tükendi
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs text-[#c8a77b] tracking-wider uppercase">
                          {product.origin || product.category.name}
                        </span>
                        {product.roastLevel && (
                          <span className="text-[10px] bg-[#f8f6f3] text-[#8c8c8c] px-2 py-1 uppercase tracking-wider">
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
                            <span key={note} className="text-[10px] bg-[#f8f6f3] text-[#6b4c3b] px-2 py-0.5 italic">
                              {note}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e5e0d8]">
                    <div>
                      <span className="text-lg font-bold text-[#1a1a1a]">{formatPrice(kgTo250g(product.price))} ₺</span>
                      <span className="text-xs text-[#8c8c8c]">/ 250g</span>
                      <p className="text-[10px] text-[#8c8c8c]">({formatPrice(product.price)} ₺/kg)</p>
                    </div>
                    <Link href={`/urunler/${product.slug}`} className="text-xs font-medium text-[#C4724B] hover:text-[#B0603A] transition uppercase tracking-wider hover:-translate-y-0.5">
                      İncele →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-24 text-[#8c8c8c]">
          <p className="text-lg mb-2">Henüz ürün eklenmemiş.</p>
          <p className="text-sm">Admin panelinden ürünleri ekleyebilirsiniz.</p>
        </div>
      )}
    </div>
  );
}
