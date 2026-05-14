"use client";

import { useCart } from "@/lib/cart-context";

export default function AddToCartInline({ id, name, price, image }: { id: string; name: string; price: number; image: string }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem({ id, name, price, image })}
      className="text-xs font-medium bg-[#C4724B] hover:bg-[#B0603A] text-white px-3 py-2 transition uppercase tracking-wider hover:-translate-y-0.5"
    >
      Sepete Ekle
    </button>
  );
}
