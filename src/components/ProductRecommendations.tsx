import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, kgTo250g } from "@/lib/price";
import { getProductImage } from "@/lib/product-images";
import QuickAddButton from "./QuickAddButton";

function score(a: { origin?: string | null; categoryId?: string; roastLevel?: string | null; process?: string | null; segment?: string | null }, b: { origin?: string | null; categoryId?: string; roastLevel?: string | null; process?: string | null; segment?: string | null }): number {
  let s = 0;
  if (a.origin && b.origin && a.origin === b.origin) s += 3;
  if (a.categoryId && b.categoryId && a.categoryId === b.categoryId) s += 2;
  if (a.roastLevel && b.roastLevel && a.roastLevel === b.roastLevel) s += 1;
  if (a.process && b.process && a.process === b.process) s += 1;
  if (a.segment && b.segment && a.segment === b.segment) s += 1;
  return s;
}

interface Item {
  id: string;
  name: string;
  slug: string;
  price: number;
  origin: string | null;
  salePrice?: number | null;
  image?: string;
  isEquipment?: boolean;
}

function ProductCard({ item }: { item: Item }) {
  const img = item.image
    ? (item.image.startsWith("http") ? item.image : item.image.startsWith("/") ? item.image : `/ekipman/${item.image}`)
    : getProductImage(item.slug);

  return (
    <div className="group bg-white border border-[#e5e0d8] hover:border-primary/30 transition-colors flex flex-col">
      <Link href={`/urunler/${item.slug}`} className="block">
        <div className="aspect-[4/3] bg-[#f5f2ed] relative overflow-hidden">
          <Image
            src={img}
            alt={item.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/urunler/${item.slug}`}>
          <p className="text-sm font-medium text-heading group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">{item.name}</p>
          {item.origin && <p className="text-xs text-muted mb-2">{item.origin}</p>}
          <p className="text-base font-semibold text-heading mt-auto">
            {item.salePrice ? (
              <><span className="text-muted line-through mr-1">{formatPrice(item.price)}₺</span>{formatPrice(item.salePrice)}₺</>
            ) : item.isEquipment ? (
              <>{formatPrice(item.price)} ₺</>
            ) : (
              <>{formatPrice(kgTo250g(item.price))} ₺ <span className="text-xs text-muted font-normal">/ 250g</span></>
            )}
          </p>
        </Link>
        <QuickAddButton productId={item.id} productName={item.name} productPrice={item.price} productImage={img} />
      </div>
    </div>
  );
}

export default async function ProductRecommendations({ productId, origin, categoryId, roastLevel, process, segment }: {
  productId: string;
  origin?: string | null;
  categoryId: string;
  roastLevel?: string | null;
  process?: string | null;
  segment?: string | null;
}) {
  const all = await prisma.product.findMany({
    where: { published: true, id: { not: productId }, status: { not: "archived" } },
    select: { id: true, name: true, slug: true, price: true, origin: true, roastLevel: true, process: true, segment: true, categoryId: true, featured: true, isBestSeller: true, category: { select: { name: true } } },
    take: 50,
  });

  const equipment = await prisma.equipment.findMany({
    where: { published: true, soldOut: false },
    select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true },
    take: 4,
  });

  const scored = all.map(p => ({ ...p, _score: score({ origin, categoryId, roastLevel, process, segment }, p) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);

  const trending = all.filter(p => p.featured || p.isBestSeller).slice(0, 4);

  const sections: { title: string; items: Item[] }[] = [];

  if (scored.length > 0) sections.push({ title: "Benzer Ürünler", items: scored.map(p => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, origin: p.origin })) });
  if (equipment.length > 0) sections.push({ title: "Tamamlayıcı Ürünler", items: equipment.map(e => ({ id: e.id, name: e.name, slug: e.slug, price: e.price, salePrice: e.salePrice, origin: null, image: e.image, isEquipment: true })) });
  if (trending.length > 0) sections.push({ title: "Trend Ürünler", items: trending.map(p => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, origin: p.origin })) });

  if (sections.length === 0) return null;

  return (
    <div className="mt-16 space-y-14">
      {sections.map(section => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-heading uppercase tracking-widest mb-6">{section.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {section.items.map(item => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
