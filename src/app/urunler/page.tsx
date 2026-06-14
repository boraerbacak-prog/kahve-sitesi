import Link from "next/link";
import Image from "next/image";
import { ViewTransition } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice, kgTo250g } from "@/lib/price";
import ShopCard from "@/components/ShopCard";
import StickyFilterBar from "@/components/StickyFilterBar";
import ReadyBadge from "@/components/ReadyBadge";
import FreshnessBar from "@/components/FreshnessBar";
import FreshnessNotifyButton from "@/components/FreshnessNotifyButton";
import { getGreenBeanThreshold } from "@/lib/delivery-estimator";
import { calculateFreshness } from "@/lib/flavor-curve";

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

const phaseFilters = [
  { key: "", label: "Tümü", emoji: "" },
  { key: "resting", label: "Dinlenme Evresi", emoji: "🟤" },
  { key: "prepeak", label: "Aroma Açanlar", emoji: "🌱" },
  { key: "peak", label: "Zirve", emoji: "✨" },
  { key: "maturity", label: "Yoğun & Gövdeli", emoji: "🍂" },
  { key: "coming_soon", label: "Yakında", emoji: "🔵" },
];

export default async function ProductsPage(props: { searchParams?: Promise<{ kat?: string; q?: string; phase?: string; segment?: string }> }) {
  const searchParams = await props.searchParams;
  const kat = searchParams?.kat;
  const q = searchParams?.q?.trim();
  const phase = searchParams?.phase;
  const segment = searchParams?.segment?.trim();

  const categories = await prisma.category.findMany({ orderBy: [{ name: "asc" }] });

  // Custom order: Espresso first, then rest
  const catOrder = ["Espresso", "Filtre Kahve", "Sporcu Kahvesi", "Türk Kahvesi"];
  const sortedCats = catOrder.map(name => categories.find(c => c.name === name)).filter((c): c is NonNullable<typeof c> => !!c);

  const where: any = { published: true };
  if (kat) where.category = { slug: kat };
  if (segment) where.segment = segment;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { origin: { contains: q, mode: "insensitive" } },
      { region: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, greenBeanThreshold] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    getGreenBeanThreshold(),
  ]);

  const enriched = products.map(p => {
    const roasted = p.roastedAt ? new Date(p.roastedAt) : null;
    const freshness = calculateFreshness({
      origin: p.origin, process: p.process, roastLevel: p.roastLevel,
      roastedAt: p.roastedAt, createdAt: p.createdAt,
    });
    return { ...p, freshness, hasRoast: !!roasted };
  });

  const filtered = phase === "coming_soon"
    ? enriched.filter(p => p.status === "coming_soon")
    : phase
      ? enriched.filter(p => p.hasRoast && p.freshness.currentPhase.name === phase)
      : enriched;

  const availablePhases = kat
    ? phaseFilters.slice(1).filter(f => {
        const matches = enriched.filter(p => {
          if (p.category?.slug !== kat) return false;
          if (f.key === "coming_soon") return p.status === "coming_soon";
          return p.hasRoast && p.freshness.currentPhase.name === f.key;
        });
        return matches.length > 0;
      })
    : phaseFilters.slice(1);

  return (
    <>
      <StickyFilterBar>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/50 mb-3 gap-2">
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-primary">
            Kahveler
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/ekipmanlar"
              className="text-xs font-semibold tracking-wider uppercase text-heading bg-white border border-border px-4 py-2 rounded hover:border-primary hover:text-primary hover:bg-page-hover transition"
            >
              Ekipmanlar
            </Link>
            <Link
              href="/imza-urunler"
              className="text-xs font-semibold tracking-wider uppercase text-heading bg-white border border-border px-4 py-2 rounded hover:border-primary hover:text-primary hover:bg-page-hover transition"
            >
              İmza Ürünler
            </Link>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2">
          {sortedCats.map((cat) => {
            const params = new URLSearchParams();
            if (kat !== cat.slug) params.set("kat", cat.slug);
            if (q) params.set("q", q);
            if (phase) params.set("phase", phase);
            const href = params.toString() ? `/urunler?${params.toString()}` : "/urunler";
            return (
              <Link
                key={cat.id}
                href={href}
                className={`pb-1 text-xs font-medium tracking-wider uppercase transition whitespace-nowrap border-b ${
                  kat === cat.slug
                    ? "text-primary border-primary"
                    : "text-placeholder border-transparent hover:text-primary hover:border-primary"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
          {availablePhases.map((f) => {
            const isActive = (phase || "") === f.key;
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (kat) params.set("kat", kat);
            if (!isActive) params.set("phase", f.key);
            const href = params.toString() ? `/urunler?${params.toString()}` : "/urunler";
            return (
              <Link
                key={f.key || "all"}
                href={href}
                className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-white text-muted border border-border hover:border-primary hover:text-primary"
                }`}
              >
                {f.emoji && <span>{f.emoji}</span>}
                {f.label}
              </Link>
            );
          })}
        </div>
        {q && (
          <p className="text-sm text-muted mt-2">
            "<strong className="text-heading">{q}</strong>" için {filtered.length} sonuç bulundu
            <Link href="/urunler" className="ml-2 text-primary hover:underline text-xs">Temizle</Link>
          </p>
        )}
      </StickyFilterBar>

      <div className="max-w-7xl mx-auto px-6 pb-16">
      <div className="flex items-center justify-end mb-3 text-[10px] text-muted">
        <span>Ürünlerdeki tazelik rozetleri hakkında </span>
        <a href="/blog/kavrum-profilleri" className="text-primary hover:underline font-medium ml-1">Neden beklemeliyim? →</a>
      </div>
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border">
        {filtered.map((product, index) => {
          const notes = product.flavorNotes ? JSON.parse(product.flavorNotes) : [];
          return (
            <ShopCard key={product.id} delay={index * 50}>
            <div className="bg-white p-6 flex flex-col">
              <Link href={`/urunler/${product.slug}`} className="group">
                <div className="aspect-[4/5] bg-page-hover mb-6 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
                      %5 Kredi
                    </span>
                    {product.greenBeanKg !== null && product.greenBeanKg < greenBeanThreshold && product.stock > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                        🔴 Tükenmek Üzere
                      </span>
                    )}
                    <ReadyBadge
                      origin={product.origin}
                      process={product.process}
                      roastLevel={product.roastLevel}
                      roastedAt={product.roastedAt}
                      createdAt={product.createdAt}
                    />
                  </div>
                  <ViewTransition name={`product-${product.id}`} share="product-morph">
                    <Image
                      src={getProductImage(product.slug)}
                      alt={product.name}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </ViewTransition>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-[#c8a77b] tracking-wider uppercase">
                      {product.origin || product.category.name}
                    </span>
                    {product.roastLevel && (
                      <span className="text-xs bg-page-hover text-muted px-2 py-1 uppercase tracking-wider">
                        {product.roastLevel === "light" ? "Zarif" : product.roastLevel === "medium" ? "İdeal" : "Karakterli"}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-heading group-hover:text-[#c8a77b] transition">
                    {product.name}
                  </h3>
                  {notes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {notes.slice(0, 3).map((note: string) => (
                        <span key={note} className="text-xs bg-page-hover text-[#6b4c3b] px-2 py-0.5 italic">{note}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2">
                    <FreshnessBar
                      origin={product.origin} process={product.process} roastLevel={product.roastLevel}
                      roastedAt={product.roastedAt} createdAt={product.createdAt}
                    />
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <span className="text-lg font-bold text-heading">{formatPrice(kgTo250g(product.price))} ₺</span>
                  <span className="text-xs text-muted">/ 250g</span>
                  <p className="text-xs text-muted">({formatPrice(product.price)} ₺/kg)</p>
                  <span className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock > 0 ? "Stokta" : "Tükendi"}
                  </span>
                </div>
                <Link href={`/urunler/${product.slug}`} className="text-xs font-medium text-primary hover:text-primary-hover transition uppercase tracking-wider hover:-translate-y-0.5">
                  İncele →
                </Link>
              </div>
              <div className="mt-2">
                <FreshnessNotifyButton productId={product.id} productName={product.name} compact />
              </div>
            </div>
            </ShopCard>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-muted">
          {q ? (
            <>
              <p className="text-lg mb-2">"{q}" için sonuç bulunamadı.</p>
              <Link href="/urunler" className="text-sm text-primary hover:underline">Tüm ürünlere göz atın</Link>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">Bu filtrelere uygun ürün yok.</p>
              <Link href="/urunler" className="text-sm text-primary hover:underline">Filtreleri temizle</Link>
            </>
          )}
        </div>
      )}
      </div>
    </>
  );
}
