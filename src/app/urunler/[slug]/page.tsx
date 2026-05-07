import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

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
  const key = imageMap[slug];
  return key ? `/products/${key}.png` : "/products/rostello.png";
}

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: true } } },
  });

  if (!product || !product.published) notFound();

  const notes = product.flavorNotes ? JSON.parse(product.flavorNotes) as string[] : [];
  const roastLabel =
    product.roastLevel === "light" ? "Hafif" : product.roastLevel === "medium" ? "Orta" : product.roastLevel === "dark" ? "Koyu" : null;
  const bodyLabel = product.body === "Full" ? "Dolgun" : product.body === "Medium" ? "Orta" : product.body === "Light" ? "Hafif" : null;
  const acidityLabel = product.acidity === "High" ? "Yüksek" : product.acidity === "Medium" ? "Orta" : product.acidity === "Low" ? "Düşük" : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] bg-[#f8f6f3] flex items-center justify-center overflow-hidden border border-[#e5e0d8]">
          <Image
            src={getProductImage(product.slug)}
            alt={product.name}
            width={600}
            height={750}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">
              {product.category.name}
            </span>
            {product.segment && (
              <span className="text-[10px] bg-[#f8f6f3] text-[#6b4c3b] px-2 py-1 uppercase tracking-wider">
                {product.segment === "specialty" ? "Özel Seçki" : "Standart"}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] leading-tight">
            {product.name}
          </h1>

          <div className="mt-6 p-6 bg-[#f8f6f3] border border-[#e5e0d8]">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#1a1a1a]">{product.price.toLocaleString("tr-TR")} ₺</span>
              <span className="text-sm text-[#8c8c8c]">/ kg</span>
            </div>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-lg text-[#8c8c8c] line-through ml-2">{product.compareAt.toLocaleString("tr-TR")} ₺</span>
            )}
          </div>

          <AddToCartButton productId={product.id} />

          <div className="grid grid-cols-2 gap-3 mt-6">
            {product.origin && (
              <div className="p-3 bg-white border border-[#e5e0d8]">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Menşei</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{product.origin}</span>
              </div>
            )}
            {product.region && (
              <div className="p-3 bg-white border border-[#e5e0d8]">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Bölge</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{product.region}</span>
              </div>
            )}
            {product.altitude && (
              <div className="p-3 bg-white border border-[#e5e0d8]">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Rakım</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{product.altitude}</span>
              </div>
            )}
            {product.process && (
              <div className="p-3 bg-white border border-[#e5e0d8]">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">İşleme</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{product.process}</span>
              </div>
            )}
            {product.variety && (
              <div className="p-3 bg-white border border-[#e5e0d8]">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Tür</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{product.variety}</span>
              </div>
            )}
            {product.grade && (
              <div className="p-3 bg-white border border-[#e5e0d8]">
                <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Sınıf</span>
                <span className="text-sm font-medium text-[#1a1a1a]">{product.grade}</span>
              </div>
            )}
          </div>

          {(roastLabel || bodyLabel || acidityLabel) && (
            <div className="flex gap-3 mt-4">
              {roastLabel && (
                <div className="flex-1 p-3 bg-white border border-[#e5e0d8] text-center">
                  <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Kavrum</span>
                  <span className="text-sm font-medium text-[#1a1a1a]">{roastLabel}</span>
                </div>
              )}
              {bodyLabel && (
                <div className="flex-1 p-3 bg-white border border-[#e5e0d8] text-center">
                  <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Gövde</span>
                  <span className="text-sm font-medium text-[#1a1a1a]">{bodyLabel}</span>
                </div>
              )}
              {acidityLabel && (
                <div className="flex-1 p-3 bg-white border border-[#e5e0d8] text-center">
                  <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wider block">Asidite</span>
                  <span className="text-sm font-medium text-[#1a1a1a]">{acidityLabel}</span>
                </div>
              )}
            </div>
          )}

          {notes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Tat Profili</h3>
              <div className="flex flex-wrap gap-2">
                {notes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1.5 bg-white border border-[#e5e0d8] text-sm text-[#6b4c3b] italic"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#e5e0d8]">
            <p className="text-[#4a4a4a] leading-relaxed">{product.description}</p>
          </div>

          {product.weight && (
            <p className="mt-4 text-sm text-[#8c8c8c]">Paket seçenekleri: 100g · 250g · 500g · 1kg</p>
          )}

          {product.reviews.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#e5e0d8]">
              <h3 className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider mb-4">Değerlendirmeler</h3>
              {product.reviews.map((review) => (
                <div key={review.id} className="mb-4 pb-4 border-b border-[#e5e0d8] last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#1a1a1a]">{review.user.name || "İsimsiz"}</span>
                    <span className="text-[#c8a77b] text-sm">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  {review.comment && <p className="text-sm text-[#4a4a4a]">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
