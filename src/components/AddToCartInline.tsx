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
  const earnPoints = (unitPrice * 0.05).toFixed(2);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {weights.map((w) => (
          <button key={w.value} onClick={() => setWeight(w.value)}
            className={`text-xs px-2.5 py-1.5 font-medium uppercase tracking-wider border transition ${
              weight === w.value ? "bg-primary text-white border-primary" : "bg-white text-body border-border hover:border-primary"
            }`}
          >{w.label}</button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-body">{unitPrice.toLocaleString("tr-TR")} ₺</span>
        <button
          onClick={() => addItem({ id, name, price, image, weight, grind: "whole" })}
          className="text-xs font-medium bg-primary hover:bg-primary-hover text-white px-4 py-1.5 transition uppercase tracking-wider"
        >
          Sepete Ekle
        </button>
      </div>
      <p className="text-[10px] text-primary">+{earnPoints} TL kredi kazan</p>
    </div>
  );
}
