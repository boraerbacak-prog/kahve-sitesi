import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, kgTo250g } from "@/lib/price";
import FreshnessBar from "./FreshnessBar";
import { getGreenBeanThreshold } from "@/lib/delivery-estimator";

function getProductImage(slug: string): string {
  const map: Record<string, string> = {
    "ethiopia-sidamo-g2": "Gemini_Generated_Image_445e1s445e1s445e",
    "ethiopia-sidamo-g4": "Gemini_Generated_Image_c7t8k5c7t8k5c7t8",
    "ethiopia-lekempt-g4": "Gemini_Generated_Image_dvivc9dvivc9dviv",
    "guatemala-shb-18-sc": "Gemini_Generated_Image_g74yvng74yvng74y",
    "colombia-supremo-18-sc": "Gemini_Generated_Image_u229vnu229vnu229",
    "brasil-mogiana": "Gemini_Generated_Image_v621nbv621nbv621",
    "ethiopia-yirga-koke-honey-g1": "Gemini_Generated_Image_jwubysjwubysjwub",
    "colombia-la-roca-pink-bourbon": "Gemini_Generated_Image_vzulafvzulafvzul",
  };
  return map[slug] ? `/products/${map[slug]}.png` : "/products/rostello.png";
}

export default async function ActiveProducts() {
  const [products, threshold] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, status: "active", stock: { gt: 0 } },
      include: { category: true },
      orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
      take: 12,
    }),
    getGreenBeanThreshold(),
  ]);

  if (products.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 border-t border-primary/5 bg-page">
      <div className="absolute inset-0 bg-gradient-to-b from-page via-transparent to-page pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow">Bugün İçime Hazır</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading mt-3 mb-3">
            Şu An <span className="text-primary">Zirvede</span> ve Stokta
          </h2>
          <p className="text-sm text-body leading-relaxed">
            Şu an en lezzetli anında olan kahveler. Her biri taze kavruldu, şimdi tam zamanı.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p, i) => (
            <Link key={p.id} href={`/urunler/${p.slug}`}
              className="group bg-white border border-border overflow-hidden hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[4/5] bg-page-hover overflow-hidden">
                <Image src={getProductImage(p.slug)} alt={p.name}
                  width={300} height={375} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {p.roastedAt && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">
                      ✅ İçime Hazır
                    </span>
                  )}
                  {p.greenBeanKg !== null && p.greenBeanKg < threshold && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                      🔴 Tükenmek Üzere
                    </span>
                  )}
                  {p.stock > 0 && p.stock <= 15 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                      ⚡ Son {p.stock}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <span className="text-[10px] tracking-[0.2em] uppercase text-primary/70 font-medium">
                  {p.origin || p.category.name}
                </span>
                <h3 className="text-sm font-bold text-heading mt-0.5 group-hover:text-primary transition-colors leading-snug">
                  {p.name}
                </h3>
                <p className="text-base font-bold text-heading mt-1.5">{formatPrice(kgTo250g(p.price))} ₺</p>
                <div className="mt-2">
                  <FreshnessBar
                    origin={p.origin} process={p.process} roastLevel={p.roastLevel}
                    roastedAt={p.roastedAt} createdAt={p.createdAt}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
