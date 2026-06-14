"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/price";

export default function QuickAddButton({ productId, productName, productPrice, productImage }: {
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
}) {
  const { addItem } = useCart();
  const [done, setDone] = useState(false);

  return (
    <button
      onClick={() => {
        addItem({ id: productId, name: productName, price: productPrice, image: productImage || "/products/rostello.png", weight: 250, grind: "whole" });
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className="w-full mt-2 py-2 text-xs font-medium tracking-wide uppercase transition bg-heading hover:bg-[#333] text-white"
    >
      {done ? "✓ Eklendi" : "Sepete Ekle · " + formatPrice(productPrice / 4) + " ₺"}
    </button>
  );
}
