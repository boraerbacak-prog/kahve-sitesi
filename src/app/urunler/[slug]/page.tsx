import Link from "next/link";
import { ViewTransition } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import OutOfStockNotifier from "@/components/OutOfStockNotifier";
import ShopCard from "@/components/ShopCard";
import FreshnessTimeline from "@/components/FreshnessTimeline";
import BrewGuide from "@/components/BrewGuide";
import FreshnessNotifyButton from "@/components/FreshnessNotifyButton";
import DeliveryFreshnessEstimate from "@/components/DeliveryFreshnessEstimate";
import { getGreenBeanThreshold } from "@/lib/delivery-estimator";
import ProductRecommendations from "@/components/ProductRecommendations";
import { formatPrice, kgTo250g } from "@/lib/price";
import { getProductImage } from "@/lib/product-images";

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const [product, greenBeanThreshold] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: { category: true, reviews: { include: { user: true } } },
    }),
    getGreenBeanThreshold(),
  ]);

  if (!product || !product.published) notFound();

  const notes = product.flavorNotes ? JSON.parse(product.flavorNotes) as string[] : [];
  const roastLabel =
    product.roastLevel === "light" ? "Zarif" : product.roastLevel === "medium" ? "İdeal" : product.roastLevel === "dark" ? "Karakterli" : null;
  const bodyLabel = product.body === "Full" ? "Dolgun" : product.body === "Medium" ? "Orta" : product.body === "Light" ? "Hafif" : null;
  const acidityLabel = product.acidity === "High" ? "Yüksek" : product.acidity === "Medium" ? "Orta" : product.acidity === "Low" ? "Düşük" : null;
  const processLabel = product.process === "Honey" ? "Ballı" : product.process === "Washed" ? "Yıkanmış" : product.process === "Natural" ? "Doğal" : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <Link href="/urunler" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition mb-8">
        ← Ürünlere Dön
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] bg-page-hover flex items-center justify-center overflow-hidden border border-border">
          <ViewTransition name={`product-${product.id}`} share="product-morph">
            <Image
              src={getProductImage(product.slug)}
              alt={product.name}
              width={600}
              height={750}
              className="w-full h-full object-contain"
            />
          </ViewTransition>
        </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">
                {product.category.name}
              </span>
              {product.segment && (
                <span className="text-xs bg-page-hover text-[#6b4c3b] px-2 py-1 uppercase tracking-wider">
                  {product.segment === "specialty" ? "Özel Seçki" : "Standart"}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-heading leading-tight">
              {product.name}
            </h1>

            <div className="mt-6 p-6 bg-page-hover border border-border">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-heading">{formatPrice(kgTo250g(product.price))} ₺</span>
                <span className="text-sm text-muted">/ 250g</span>
              </div>
              <p className="text-sm text-muted mt-1">{formatPrice(product.price)} ₺/kg</p>
              {product.compareAt && product.compareAt > product.price && (
                <span className="text-lg text-muted line-through ml-2">{formatPrice(product.compareAt)} ₺</span>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-sm font-semibold px-2 py-0.5 ${product.stock > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                  {product.stock > 0 ? "Stokta" : "Tükendi"}
                </span>
                {product.greenBeanKg !== null && product.greenBeanKg < greenBeanThreshold && product.stock > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                    🔴 Tükenmek Üzere
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <BrewGuide
                origin={product.origin}
                process={product.process}
                roastLevel={product.roastLevel}
                body={product.body}
              />
            </div>

            {product.stock > 0 ? (
              <AddToCartButton productId={product.id} productName={product.name} productPrice={product.price} productImage={getProductImage(product.slug)} />
            ) : (
              <OutOfStockNotifier productId={product.id} productName={product.name} />
            )}

          <ShopCard delay={50}>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {product.origin && (
                <div className="p-3 bg-white border border-border">
                  <span className="text-xs text-muted uppercase tracking-wider block">Menşei</span>
                  <span className="text-sm font-medium text-heading">{product.origin}</span>
                </div>
              )}
              {product.region && (
                <div className="p-3 bg-white border border-border">
                  <span className="text-xs text-muted uppercase tracking-wider block">Bölge</span>
                  <span className="text-sm font-medium text-heading">{product.region}</span>
                </div>
              )}
              {product.altitude && (
                <div className="p-3 bg-white border border-border">
                  <span className="text-xs text-muted uppercase tracking-wider block">Rakım</span>
                  <span className="text-sm font-medium text-heading">{product.altitude}</span>
                </div>
              )}
              {product.process && (
                <div className="p-3 bg-white border border-border">
                  <span className="text-xs text-muted uppercase tracking-wider block">İşleme</span>
                  <span className="text-sm font-medium text-heading">{processLabel || product.process}</span>
                </div>
              )}
              {product.variety && (
                <div className="p-3 bg-white border border-border">
                  <span className="text-xs text-muted uppercase tracking-wider block">Tür</span>
                  <span className="text-sm font-medium text-heading">{product.variety}</span>
                </div>
              )}
              {product.grade && (
                <div className="p-3 bg-white border border-border">
                  <span className="text-xs text-muted uppercase tracking-wider block">Sınıf</span>
                  <span className="text-sm font-medium text-heading">{product.grade}</span>
                </div>
              )}
            </div>
          </ShopCard>

          <ShopCard delay={100}>
            {(roastLabel || bodyLabel || acidityLabel) && (
              <div className="flex gap-3 mt-4">
                {roastLabel && (
                  <div className="flex-1 p-3 bg-white border border-border text-center">
                    <span className="text-xs text-muted uppercase tracking-wider block">Kavrum</span>
                    <span className="text-sm font-medium text-heading">{roastLabel}</span>
                  </div>
                )}
                {bodyLabel && (
                  <div className="flex-1 p-3 bg-white border border-border text-center">
                    <span className="text-xs text-muted uppercase tracking-wider block">Gövde</span>
                    <span className="text-sm font-medium text-heading">{bodyLabel}</span>
                  </div>
                )}
                {acidityLabel && (
                  <div className="flex-1 p-3 bg-white border border-border text-center">
                    <span className="text-xs text-muted uppercase tracking-wider block">Asidite</span>
                    <span className="text-sm font-medium text-heading">{acidityLabel}</span>
                  </div>
                )}
              </div>
            )}
          </ShopCard>

          <ShopCard delay={150}>
            {notes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-heading uppercase tracking-wider mb-3">Tat Profili</h3>
                <div className="flex flex-wrap gap-2">
                  {notes.map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1.5 bg-white border border-border text-sm text-[#6b4c3b] italic"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </ShopCard>

          <ShopCard delay={175}>
            <div className="mt-8">
              <FreshnessTimeline
                origin={product.origin}
                process={product.process}
                roastLevel={product.roastLevel}
                roastedAt={product.roastedAt}
                createdAt={product.createdAt}
              />
              <div className="mt-2 text-right">
                <a href="/blog/kavrum-profilleri" className="text-[10px] text-primary hover:underline font-medium">
                  Neden beklemeliyim? →
                </a>
              </div>
              <FreshnessNotifyButton productId={product.id} productName={product.name} />
              <DeliveryFreshnessEstimate
                origin={product.origin}
                process={product.process}
                roastLevel={product.roastLevel}
                roastedAt={product.roastedAt}
                createdAt={product.createdAt}
              />
            </div>
          </ShopCard>

          <ShopCard delay={200}>
            {product.reviews.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-heading uppercase tracking-wider mb-4">Değerlendirmeler</h3>
                {product.reviews.map((review) => (
                  <div key={review.id} className="mb-4 pb-4 border-b border-border last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-heading">{review.user.name || "İsimsiz"}</span>
                      <span className="text-[#c8a77b] text-sm">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-body">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </ShopCard>

          <ProductRecommendations
            productId={product.id}
            origin={product.origin}
            categoryId={product.categoryId}
            roastLevel={product.roastLevel}
            process={product.process}
            segment={product.segment}
          />
        </div>
      </div>
    </div>
  );
}
