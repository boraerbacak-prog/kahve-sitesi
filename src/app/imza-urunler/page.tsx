"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import RevealOnScroll from "@/components/RevealOnScroll";
import StickyFilterBar from "@/components/StickyFilterBar";
import ProductLightbox from "@/components/ProductLightbox";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { ProductDetail } from "@/components/ProductDetailModal";

interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; salePrice: number | null; image: string;
  category: string; sizes: string; published: boolean;
}

function fmtPrice(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ImzaUrunlerPage() {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loyalty, setLoyalty] = useState<{ tier: string; tierDiscountPct: number } | null>(null);
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);

  useEffect(() => {
    fetch("/api/admin/signature-products").then(r => r.json()).then(d => {
      if (d.products) setItems(d.products.filter((p: Product) => p.published));
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetch("/api/sadakat/puan")
        .then(r => r.json())
        .then(d => { if (d.tierDiscountPct !== undefined) setLoyalty(d); })
        .catch(() => {});
    }
  }, [session]);

  return (
    <>
      <StickyFilterBar>
        <div className="flex gap-10 overflow-x-auto pb-2">
          <Link href="/urunler" className="pb-3 text-sm font-bold tracking-[0.15em] uppercase transition whitespace-nowrap text-muted border-b-[3px] border-transparent hover:text-primary hover:border-primary">
            Kahveler
          </Link>
          <Link href="/ekipmanlar" className="pb-3 text-sm font-bold tracking-[0.15em] uppercase transition whitespace-nowrap text-muted border-b-[3px] border-transparent hover:text-primary hover:border-primary">
            Ekipmanlar
          </Link>
          <span className="pb-3 text-sm font-bold tracking-[0.15em] uppercase whitespace-nowrap text-primary border-b-[3px] border-primary">
            İmza Ürünler
          </span>
        </div>
      </StickyFilterBar>
      <div className="max-w-7xl mx-auto px-6 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {items.map((item, index) => {
          const imgSrc = item.image.startsWith("/") ? item.image : `/imza-urunler/${item.image}`;
          return (
            <RevealOnScroll key={item.id} delay={index * 50}>
            <div className="bg-white p-8 flex flex-col">
              <button
                className="aspect-[4/3] bg-page-hover mb-6 flex items-center justify-center border border-border overflow-hidden w-full cursor-zoom-in group"
                onClick={() => setLightbox({ image: imgSrc, title: item.name })}
              >
                <Image
                  src={imgSrc}
                  alt={item.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium mb-1">{item.category}</span>
              <h3 className="text-lg font-bold text-heading mb-2">{item.name}</h3>
              <p className="text-sm text-body leading-relaxed flex-1 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div>
                  {item.salePrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-heading">{fmtPrice(item.salePrice)} ₺</span>
                      <span className="text-sm text-muted line-through">{fmtPrice(item.price)} ₺</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-heading">{fmtPrice(item.price)} ₺</span>
                  )}
                  {loyalty && loyalty.tierDiscountPct > 0 && (
                    <div className="text-xs text-green-700 mt-1">
                      <span className="font-medium capitalize">{loyalty.tier}</span> üye: <strong>%{loyalty.tierDiscountPct}</strong> indirim → <span className="font-semibold">{fmtPrice((item.salePrice || item.price) * (1 - loyalty.tierDiscountPct / 100))} ₺</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addItem({ id: `imza-${item.id}`, name: item.name, price: item.salePrice || item.price, image: imgSrc, weight: 0, grind: "" })}
                    className="text-xs font-medium bg-primary hover:bg-primary-hover text-white px-3 py-2 transition uppercase tracking-wider"
                  >
                    Sepete Ekle
                  </button>
                  <button
                    onClick={() => setDetail({
                      id: `imza-${item.id}`,
                      image: imgSrc,
                      title: item.name,
                      price: fmtPrice(item.price),
                      salePrice: item.salePrice ? fmtPrice(item.salePrice) : null,
                      desc: item.description,
                      cat: item.category,
                    })}
                    className="text-xs font-medium border border-border hover:border-primary text-heading px-3 py-2 transition uppercase tracking-wider"
                  >
                    Detay
                  </button>
                </div>
              </div>
            </div>
            </RevealOnScroll>
          );
        })}
      </div>

      {lightbox && (
        <ProductLightbox image={lightbox.image} title={lightbox.title} onClose={() => setLightbox(null)} />
      )}
      {detail && (
        <ProductDetailModal product={detail} onClose={() => setDetail(null)} />
      )}
      </div>
    </>
  );
}
