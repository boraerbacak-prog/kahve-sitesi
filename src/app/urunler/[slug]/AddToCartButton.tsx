"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({ productId, productName, productPrice, productImage }: { productId: string; productName: string; productPrice: number; productImage: string }) {
  const { addItem } = useCart();
  const [weight, setWeight] = useState(250);
  const [grind, setGrind] = useState("whole");

  const unitPrice = productPrice * (weight / 1000);

  return (
    <div className="mt-6">
      <div className="flex gap-2 mb-3">
        {[250, 500, 1000].map((w) => (
          <button key={w} onClick={() => setWeight(w)}
            className={`flex-1 text-xs py-2 uppercase tracking-wider border transition ${
              weight === w ? "bg-[#C4724B] text-white border-[#C4724B]" : "bg-white text-[#4a4a4a] border-[#e5e0d8] hover:border-[#C4724B]"
            }`}
          >{w > 999 ? "1 kg" : `${w}g`}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setGrind("whole")}
          className={`flex-1 text-xs py-2 uppercase tracking-wider border transition ${
            grind === "whole" ? "bg-[#C4724B] text-white border-[#C4724B]" : "bg-white text-[#4a4a4a] border-[#e5e0d8] hover:border-[#C4724B]"
          }`}
        >Çekirdek</button>
        <button onClick={() => setGrind("ground")}
          className={`flex-1 text-xs py-2 uppercase tracking-wider border transition ${
            grind === "ground" ? "bg-[#C4724B] text-white border-[#C4724B]" : "bg-white text-[#4a4a4a] border-[#e5e0d8] hover:border-[#C4724B]"
          }`}
        >Öğütülmüş</button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-[#1a1a1a]">{unitPrice.toLocaleString("tr-TR")} ₺</span>
        <button
          onClick={() => addItem({ id: productId, name: productName, price: productPrice, image: productImage, weight, grind })}
          className="bg-[#1a1a1a] hover:bg-[#333] text-white py-3 px-8 text-sm font-medium tracking-wide uppercase transition"
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}
