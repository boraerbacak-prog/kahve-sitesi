"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

const weights = [
  { value: 250, label: "250g" },
  { value: 500, label: "500g" },
  { value: 1000, label: "1 kg" },
];

export default function AddToCartInline({ id, name, price, image }: { id: string; name: string; price: number; image: string }) {
  const { addItem } = useCart();
  const [weight, setWeight] = useState(250);

  const unitPrice = price * (weight / 1000);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {weights.map((w) => (
          <button key={w.value} onClick={() => setWeight(w.value)}
            className={`text-[10px] px-2.5 py-1.5 font-medium uppercase tracking-wider border transition ${
              weight === w.value ? "bg-[#C4724B] text-white border-[#C4724B]" : "bg-white text-[#4a4a4a] border-[#e5e0d8] hover:border-[#C4724B]"
            }`}
          >{w.label}</button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#4a4a4a]">{unitPrice.toLocaleString("tr-TR")} ₺</span>
        <button
          onClick={() => addItem({ id, name, price, image, weight, grind: "whole" })}
          className="text-xs font-medium bg-[#C4724B] hover:bg-[#B0603A] text-white px-4 py-1.5 transition uppercase tracking-wider"
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}
