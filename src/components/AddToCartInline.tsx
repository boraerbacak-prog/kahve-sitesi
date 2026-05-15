"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function AddToCartInline({ id, name, price, image }: { id: string; name: string; price: number; image: string }) {
  const { addItem } = useCart();
  const [weight, setWeight] = useState(250);
  const [grind, setGrind] = useState("whole");

  const unitPrice = price * (weight / 1000);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {[250, 500, 1000].map((w) => (
          <button key={w} onClick={() => setWeight(w)}
            className={`text-[10px] px-2 py-1 uppercase tracking-wider border transition ${
              weight === w ? "bg-[#C4724B] text-white border-[#C4724B]" : "bg-white text-[#4a4a4a] border-[#e5e0d8] hover:border-[#C4724B]"
            }`}
          >{w > 999 ? "1 kg" : `${w}g`}</button>
        ))}
      </div>
      <div className="flex gap-1">
        <button onClick={() => setGrind("whole")}
          className={`text-[10px] px-2 py-1 uppercase tracking-wider border transition ${
            grind === "whole" ? "bg-[#C4724B] text-white border-[#C4724B]" : "bg-white text-[#4a4a4a] border-[#e5e0d8] hover:border-[#C4724B]"
          }`}
        >Çekirdek</button>
        <button onClick={() => setGrind("ground")}
          className={`text-[10px] px-2 py-1 uppercase tracking-wider border transition ${
            grind === "ground" ? "bg-[#C4724B] text-white border-[#C4724B]" : "bg-white text-[#4a4a4a] border-[#e5e0d8] hover:border-[#C4724B]"
          }`}
        >Öğütülmüş</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4a4a4a] font-medium">{unitPrice.toLocaleString("tr-TR")} ₺</span>
        <button
          onClick={() => addItem({ id, name, price, image, weight, grind })}
          className="text-xs font-medium bg-[#C4724B] hover:bg-[#B0603A] text-white px-3 py-2 transition uppercase tracking-wider hover:-translate-y-0.5"
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}
