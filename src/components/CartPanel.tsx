"use client";

import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/price";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const FREE_SHIPPING_THRESHOLD = 990;

export default function CartPanel() {
  const { items, total, count, isOpen, closeCart, removeItem, updateQuantity } = useCart();
  const { data: session } = useSession();
  const [loyalty, setLoyalty] = useState<{ points: number; tier: string } | null>(null);

  useEffect(() => {
    if (session && isOpen) {
      fetch("/api/sadakat/puan")
        .then((r) => r.json())
        .then((d) => { if (d.points !== undefined) setLoyalty(d); })
        .catch(() => {});
    } else {
      setLoyalty(null);
    }
  }, [session, isOpen]);

  const shippingProgress = Math.min(total / FREE_SHIPPING_THRESHOLD, 1);
  const remaining = FREE_SHIPPING_THRESHOLD - total;
  const earnPoints = items.reduce((s, i) => s + Math.round(i.price * i.quantity), 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[60]" onClick={closeCart}>
          <div className="absolute inset-0 bg-black/5" />
        </div>
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e0d8]">
            <h2 className="text-lg font-semibold text-[#1a1a1a]">Sepet ({count})</h2>
            <button onClick={closeCart} className="p-1 text-[#8c8c8c] hover:text-[#1a1a1a] transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress */}
          {items.length > 0 && (
            <div className="px-6 pt-4 pb-2">
              <div className="bg-[#f5f2ed] rounded-lg p-3">
                <div className="flex items-center justify-between text-xs text-[#666] mb-1.5">
                  <span>🚚 Kargo</span>
                  {remaining > 0 ? (
                    <span>{remaining.toFixed(0)} ₺ kaldı</span>
                  ) : (
                    <span className="text-green-700 font-semibold">Ücretsiz 🎉</span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-[#e5e0d8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C4724B] rounded-full transition-all duration-500" style={{ width: `${Math.min(shippingProgress * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Loyalty Info */}
          {items.length > 0 && (
            <div className="px-6 pb-2">
              <Link href="/sadakat" onClick={closeCart} className="flex items-center gap-1.5 text-xs text-[#C4724B] hover:text-[#B0603A] transition">
                <span>⭐</span>
                {loyalty ? (
                  <span><strong>{loyalty.points}</strong> puanın var · Bu siparişten <strong>{earnPoints}</strong> puan kazanırsın</span>
                ) : session ? (
                  <span>Puanlarını gör</span>
                ) : (
                  <span>Her alışverişte puan kazan — <strong>Üye ol</strong></span>
                )}
                <span>→</span>
              </Link>
            </div>
          )}

          <div className="flex-1 overflow-auto px-6 py-2">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#8c8c8c] mb-6">Sepetiniz boş</p>
                <Link href="/urunler" onClick={closeCart} className="inline-block bg-[#C4724B] hover:bg-[#B0603A] text-white px-6 py-3 text-sm font-medium transition">
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-[#e5e0d8]">
                    <div className="w-16 h-16 bg-[#f5f2ed] flex items-center justify-center flex-shrink-0 rounded">
                      <span className="text-2xl">☕</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#1a1a1a] truncate">{item.name}</h3>
                      <p className="text-xs text-[#8c8c8c] mt-0.5">{item.weight > 999 ? "1 kg" : `${item.weight}g`} · {item.grind === "whole" ? "Çekirdek" : item.grind === "v60" ? "V60" : item.grind === "french-press" ? "French Press" : item.grind === "moka" ? "Moka Pot" : item.grind === "espresso" ? "Espresso" : item.grind === "cezve" ? "Cezve" : item.grind === "filter" ? "Filtre Mak." : "Çekirdek"}</p>
                      <p className="text-sm text-[#C4724B] mt-1">{formatPrice(item.price)} ₺</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 border border-[#e5e0d8] flex items-center justify-center text-sm text-[#8c8c8c] hover:bg-[#f5f2ed] transition"
                        >-</button>
                        <span className="text-sm text-[#1a1a1a]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-[#e5e0d8] flex items-center justify-center text-sm text-[#8c8c8c] hover:bg-[#f5f2ed] transition"
                        >+</button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[#ccc] hover:text-[#e74c3c] transition self-start p-1">
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
            <div className="border-t border-[#e5e0d8] px-6 py-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#1a1a1a]">Toplam</span>
                <span className="text-lg font-bold text-[#1a1a1a]">{formatPrice(total)} ₺</span>
              </div>
              <p className="text-xs text-[#8c8c8c] mb-4">+{earnPoints} puan kazanacaksın</p>
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
