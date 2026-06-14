"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/price";

const weights = [
  { value: 250, label: "250g" },
  { value: 500, label: "500g" },
  { value: 1000, label: "1 kg" },
];

const grindOptions = [
  { value: "whole", label: "Çekirdek" },
  { value: "v60", label: "V60" },
  { value: "french-press", label: "French Press" },
  { value: "moka", label: "Moka Pot" },
  { value: "espresso", label: "Espresso" },
  { value: "cezve", label: "Cezve" },
  { value: "filter", label: "Filtre Mak." },
];

export default function AddToCartButton({ productId, productName, productPrice, productImage }: { productId: string; productName: string; productPrice: number; productImage: string }) {
  const { addItem } = useCart();
  const [weight, setWeight] = useState(250);
  const [grind, setGrind] = useState("whole");

  const unitPrice = productPrice * (weight / 1000);

  return (
    <div className="mt-6 space-y-4">
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Miktar</p>
        <div className="flex gap-2">
          {weights.map((w) => (
            <button key={w.value} onClick={() => setWeight(w.value)}
              className={`flex-1 text-sm py-2.5 font-medium tracking-wide border transition ${
                weight === w.value ? "bg-primary text-white border-primary" : "bg-white text-body border-border hover:border-primary"
              }`}
            >{w.label}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Öğütme</p>
        <div className="flex flex-wrap gap-1.5">
          {grindOptions.map((o) => (
            <button key={o.value} onClick={() => setGrind(o.value)}
              className={`text-xs py-1.5 px-3 font-medium border transition ${
                grind === o.value ? "bg-primary text-white border-primary" : "bg-white text-body border-border hover:border-primary"
              }`}
            >{o.label}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xl font-bold text-heading">{formatPrice(unitPrice)} ₺</span>
          {weight !== 1000 && (
            <span className="text-sm text-muted ml-2">({formatPrice(productPrice)} ₺/kg)</span>
          )}
        </div>
        <button
          onClick={() => addItem({ id: productId, name: productName, price: productPrice, image: productImage, weight, grind })}
          className="bg-heading hover:bg-[#333] text-white py-3 px-8 text-sm font-medium tracking-wide uppercase transition"
        >
          Sepete Ekle
        </button>
      </div>
      {unitPrice > 0 && (
        <p className="text-xs text-primary">+{(unitPrice * 0.05).toFixed(2)} TL kredi kazan</p>
      )}
    </div>
  );
}
