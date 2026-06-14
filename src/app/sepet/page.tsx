"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/price";
import CartRecommendations from "@/components/CartRecommendations";

export default function CartPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyalty, setLoyalty] = useState<{ points: number; totalSpent: number; availableTL: number; pendingTL: number; monthlyEarnedTL: number; monthlyCapTL: number; monthlyProgressPct: number } | null>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/sepet")
        .then((r) => r.json())
        .then((d) => setItems(d.items))
        .finally(() => setLoading(false));
      fetch("/api/sadakat/puan")
        .then((r) => r.json())
        .then((d) => { if (d.points !== undefined) setLoyalty(d); })
        .catch(() => {});
    } else {
      setLoading(false);
    }
  }, [session]);

  const removeItem = async (itemId: string) => {
    await fetch("/api/sepet", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl text-amber-700 mb-4">Sepetiniz boş</p>
        <Link href="/giris" className="text-amber-800 underline">Giriş yapın</Link>
      </div>
    );
  }

  if (loading) return <div className="text-center py-16 text-amber-600">Yükleniyor...</div>;

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const ekipmanImzaTotal = items
    .filter(i => i.product.category?.type === "ekipman" || i.product.category?.type === "imza")
    .reduce((s, i) => s + i.product.price * i.quantity, 0);
  const kahveTotal = items
    .filter(i => i.product.category?.type === "kahve" && !i.product.loyaltyExcluded)
    .reduce((s, i) => s + i.product.price * i.quantity, 0);
  const earnKurus = Math.round(kahveTotal * 100 * 0.05);
  const finalTotal = total;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Sepetim</h1>

      {loyalty && (
        <div className="bg-white border border-border p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-body">
                <strong>{(loyalty.availableTL || 0).toFixed(2)} TL</strong> kullanılabilir bakiyen var
                {loyalty.pendingTL > 0 && (
                  <span className="text-amber-600 ml-2">({loyalty.pendingTL.toFixed(2)} TL bekliyor)</span>
                )}
              </p>
              <p className="text-xs text-muted mt-0.5">Her kahve alışverişinde <strong>%5</strong> Çekirdek Kredi kazanırsın</p>
              {kahveTotal > 0 && (
                <p className="text-xs text-muted">Bu siparişten <strong>{(earnKurus / 100).toFixed(2)} TL</strong> daha kazanacaksın</p>
              )}
              {loyalty.monthlyCapTL > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-muted mb-0.5">
                    <span>Aylık kazanım: {loyalty.monthlyEarnedTL.toFixed(2)} TL / {loyalty.monthlyCapTL.toFixed(2)} TL</span>
                    <span>%{Math.min(100, Math.round((loyalty.monthlyEarnedTL / loyalty.monthlyCapTL) * 100))}</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        loyalty.monthlyProgressPct >= 80 ? "bg-red-500" : loyalty.monthlyProgressPct >= 50 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(loyalty.monthlyProgressPct, 100)}%` }}
                    />
          <CartRecommendations cartItems={items} cartTotal={finalTotal} />
          </div>
        </div>
      )}
            </div>
            <Link href="/sadakat" className="text-xs text-primary hover:underline">Detaylar →</Link>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 p-4 mb-6">
          <p className="text-xs text-amber-700">
              <strong>{(1000 - total) > 0 ? `${(1000 - total).toFixed(0)} ₺` : "Tebrikler!"}</strong> kalan üründe kargo ücretsiz
            </p>
            <div className="w-full h-1.5 bg-amber-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((total / 1000) * 100, 100)}%` }} />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-amber-700 mb-4">Sepetiniz boş</p>
          <Link href="/urunler" className="bg-amber-600 text-white px-6 py-3 rounded-full">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-amber-100 p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted font-bold">KG</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">{item.product.name}</h3>
                <p className="text-sm text-amber-600">{item.quantity} x {formatPrice(item.product.price)} ₺</p>
              </div>
              <p className="font-bold text-amber-900">{formatPrice(item.product.price * item.quantity)} ₺</p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Sil
              </button>
            </div>
          ))}

          <div className="bg-white border border-border p-6 mt-6">
            <div className="flex justify-between text-lg font-bold text-heading">
              <span>Toplam</span>
              <span>{formatPrice(finalTotal)} TL</span>
            </div>
            {earnKurus > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Bu siparişten <strong>{(earnKurus / 100).toFixed(2)} ₺</strong> Çekirdek Kredi kazanacaksın
              </p>
            )}
            {loyalty && loyalty.availableTL > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">
                Kullanılabilir bakiyen: <strong>{loyalty.availableTL.toFixed(2)} ₺</strong> — ödeme sayfasında kullanabilirsin
              </p>
            )}
            <Link
              href="/odeme"
              className="mt-4 block w-full bg-amber-600 hover:bg-amber-500 text-white text-center py-3 rounded-full font-semibold transition"
            >
              Ödemeye Geç
            </Link>
          </div>
        </div>
        <CartRecommendations cartItems={items} cartTotal={finalTotal} />
        </>
      )}
    </div>
  );
}
