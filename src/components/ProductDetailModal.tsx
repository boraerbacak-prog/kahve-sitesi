"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/price";

export type ProductDetail = {
  id: string;
  image: string;
  title: string;
  price: string;
  salePrice: string | null;
  desc: string;
  cat?: string;
};

type Props = {
  product: ProductDetail;
  onClose: () => void;
};

export default function ProductDetailModal({ product, onClose }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const displayPrice = product.salePrice || product.price;
  const numericPrice = parseFloat(displayPrice.replace(/\./g, "").replace(",", "."));

  const handleAdd = () => {
    addItem({ id: product.id, name: product.title, price: numericPrice, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-[#1a1a1a] transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-[#f8f6f3] flex items-center justify-center overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            {product.cat && (
              <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium mb-2">
                {product.cat}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a] leading-tight mb-4">
              {product.title}
            </h2>

            <p className="text-sm text-[#4a4a4a] leading-relaxed mb-6">
              {product.desc}
            </p>

            {/* Price */}
            <div className="mb-6">
              {product.salePrice ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#1a1a1a]">{formatPrice(product.salePrice)} ₺</span>
                  <span className="text-base text-[#8c8c8c] line-through">{formatPrice(product.price)} ₺</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-[#1a1a1a]">{formatPrice(product.price)} ₺</span>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <span className="text-xs font-medium text-[#8c8c8c] uppercase tracking-wider block mb-2">Adet</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 border border-[#e5e0d8] flex items-center justify-center text-lg text-[#1a1a1a] hover:bg-[#f8f6f3] transition"
                >
                  −
                </button>
                <span className="w-10 text-center text-lg font-medium text-[#1a1a1a]">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 border border-[#e5e0d8] flex items-center justify-center text-lg text-[#1a1a1a] hover:bg-[#f8f6f3] transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-3 text-sm font-medium uppercase tracking-wider transition ${
                added
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#C4724B] hover:bg-[#B0603A] text-white"
              }`}
            >
              {added ? "✓ Sepete Eklendi" : "Sepete Ekle"}
            </button>

            {/* Total */}
            <p className="text-xs text-[#8c8c8c] mt-3 text-center">
              Toplam: {formatPrice(numericPrice * qty)} ₺
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
