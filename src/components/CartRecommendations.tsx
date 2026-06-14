"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, kgTo250g } from "@/lib/price";
import { getProductImage } from "@/lib/product-images";

interface RecItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  origin?: string | null;
  image?: string | null;
  type: "product" | "equipment" | "signature";
}

function getItemImage(item: RecItem): string {
  if (item.image) {
    if (item.image.startsWith("http")) return item.image;
    if (item.image.startsWith("/")) return item.image;
    if (item.type === "equipment") return `/ekipman/${item.image}`;
    return `/imza-urunler/${item.image}`;
  }
  return getProductImage(item.slug);
}

function getItemLink(item: RecItem): string {
  if (item.type === "equipment") return `/ekipmanlar`;
  if (item.type === "signature") return `/imza-urunler`;
  return `/urunler/${item.slug}`;
}

function getItemPrice(item: RecItem): string {
  if (item.salePrice) {
    return `${formatPrice(item.salePrice)} ₺`;
  }
  if (item.type === "equipment" || item.type === "signature") {
    return `${formatPrice(item.price)} ₺`;
  }
  return `${formatPrice(kgTo250g(item.price))} ₺`;
}

function CarouselCard({ item }: { item: RecItem }) {
  const img = getItemImage(item);
  return (
    <Link href={getItemLink(item)} className="flex-shrink-0 group block">
      <div className="w-40 sm:w-44 bg-white border border-border hover:border-primary/30 transition-colors overflow-hidden">
        <div className="aspect-square bg-page-hover relative overflow-hidden">
          <Image src={img} alt={item.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" sizes="176px" />
        </div>
        <div className="p-2.5">
          <p className="text-[11px] font-medium text-heading line-clamp-2 leading-snug mb-1">{item.name}</p>
          <p className="text-xs font-semibold text-heading">{getItemPrice(item)}</p>
          <p className="text-[9px] text-muted uppercase tracking-wider mt-0.5">
            {item.type === "product" ? "Kahve" : item.type === "equipment" ? "Ekipman" : "İmza Ürün"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CartRecommendations({ cartItems, cartTotal }: { cartItems: { id: string; productId?: string }[]; cartTotal: number }) {
  const [items, setItems] = useState<RecItem[]>([]);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const productIds = cartItems.map(i => i.productId || i.id).filter(Boolean);
    if (productIds.length === 0) return;
    const params = new URLSearchParams({ items: productIds.join(","), total: String(cartTotal) });
    fetch(`/api/recommendations/cart?${params}`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => {});
  }, [cartItems, cartTotal]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;
    let animId: number;
    let pos = 0;
    const speed = 0.5;

    const step = () => {
      if (!paused) {
        pos -= speed;
        const cardWidth = 176;
        const gap = 12;
        const totalWidth = items.length * (cardWidth + gap);
        if (pos <= -totalWidth) pos = 0;
        el.style.transform = `translateX(${pos}px)`;
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [items, paused]);

  if (items.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-border overflow-hidden">
      <p className="text-xs text-muted uppercase tracking-wider mb-3">Bunlar da var →</p>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex gap-3 overflow-hidden">
          <div ref={scrollRef} className="flex gap-3 will-change-transform" style={{ whiteSpace: "nowrap" }}>
            {[...items, ...items].map((item, idx) => (
              <CarouselCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
