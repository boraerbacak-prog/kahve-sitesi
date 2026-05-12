"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export default function CartPanel() {
  const { items, total, count, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[60]" onClick={closeCart}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        </div>
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#1a1a1a] shadow-xl z-[70] transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Sepet ({count})</h2>
            <button onClick={closeCart} className="p-1 text-white/60 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white/50 mb-6">Sepetiniz boş</p>
                <Link href="/urunler" onClick={closeCart} className="inline-block bg-[#C4724B] hover:bg-[#B0603A] text-white px-6 py-3 text-sm font-medium transition">
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-white/10">
                    <div className="w-16 h-16 bg-white/5 flex items-center justify-center flex-shrink-0 rounded">
                      <span className="text-2xl">☕</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                      <p className="text-sm text-[#C4724B] mt-1">{item.price.toFixed(2)} ₺</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 border border-white/20 flex items-center justify-center text-sm text-white/60 hover:bg-white/10 transition"
                        >-</button>
                        <span className="text-sm text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-white/20 flex items-center justify-center text-sm text-white/60 hover:bg-white/10 transition"
                        >+</button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-white transition self-start p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-white/10 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white">Toplam</span>
                <span className="text-lg font-bold text-white">{total.toFixed(2)} ₺</span>
              </div>
              <Link
                href="/sepet"
                onClick={closeCart}
                className="block w-full bg-[#C4724B] hover:bg-[#B0603A] text-white text-center py-3 text-sm font-medium transition"
              >
                Sepete Git
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
