"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/price";

export default function CartPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyalty, setLoyalty] = useState<{ points: number; tier: string; totalSpent: number; tierDiscountPct: number; shippingThreshold: number } | null>(null);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [redeemMessage, setRedeemMessage] = useState("");
  const [redeeming, setRedeeming] = useState(false);

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

  const usePoints = async () => {
    if (!redeemAmount || redeemAmount <= 0) return;
    setRedeeming(true);
    setRedeemMessage("");
    try {
      const res = await fetch("/api/sadakat/puan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", points: redeemAmount, reference: "sepet" }),
      });
      const data = await res.json();
      if (data.success) {
        setRedeemMessage(`${data.discountLira.toFixed(2)} ₺ indirim kazandın! Kupon kodu: ROSTELLO-${Date.now()}`);
        setLoyalty((p) => p ? { ...p, points: p.points - redeemAmount } : p);
      } else {
        setRedeemMessage("Hata: " + (data.error || "Bilinmeyen hata"));
      }
    } catch {
      setRedeemMessage("Bir hata oluştu");
    }
    setRedeeming(false);
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
  const earnPoints = Math.round(total);
  const discount = loyalty ? total * (loyalty.tierDiscountPct / 100) : 0;
  const finalTotal = total - discount;

  const maxRedeem = loyalty ? Math.min(loyalty.points, Math.floor((total * 0.5) / 0.05)) : 0;
  const pointsLira = Math.round((redeemAmount || 0) * 0.05 * 100) / 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Sepetim</h1>

      {/* Loyalty Info */}
      {loyalty && (
        <div className="bg-white rounded-xl border border-amber-100 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-800">
                <span className="font-semibold capitalize">{loyalty.tier}</span> üye · <strong>{loyalty.points}</strong> puanın var
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Bu siparişten <strong>+{earnPoints}</strong> puan kazanacaksın</p>
            </div>
            <Link href="/sadakat" className="text-xs text-[#C4724B] hover:underline">Detaylar →</Link>
          </div>
          {loyalty.tierDiscountPct > 0 && (
            <div className="mt-2 pt-2 border-t border-amber-100">
              <p className="text-xs text-green-700">🎉 <strong>%{loyalty.tierDiscountPct}</strong> seviye indirimin var ({discount.toFixed(2)} ₺)</p>
            </div>
          )}
        </div>
      )}

      {/* Free Shipping */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 p-4 mb-6">
          <p className="text-xs text-amber-700">
            🚚 <strong>{(990 - total) > 0 ? `${(990 - total).toFixed(0)} ₺` : "Tebrikler!"}</strong> kalan üründe kargo ücretsiz
          </p>
          <div className="w-full h-1.5 bg-amber-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#C4724B] rounded-full transition-all" style={{ width: `${Math.min((total / 990) * 100, 100)}%` }} />
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
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-amber-100 p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
                ☕
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

          {/* Points Redemption */}
          {loyalty && loyalty.points >= 100 && (
            <div className="bg-white rounded-xl border border-amber-100 p-5">
              <h3 className="text-sm font-bold text-amber-900 mb-3">⭐ Puan Kullan</h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={100}
                  max={maxRedeem}
                  step={100}
                  value={redeemAmount || ""}
                  onChange={(e) => setRedeemAmount(parseInt(e.target.value) || 0)}
                  placeholder="Puan miktarı"
                  className="flex-1 border border-[#e5e0d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">Maks: {maxRedeem}</span>
                <button
                  onClick={usePoints}
                  disabled={redeeming || !redeemAmount}
                  className="bg-[#C4724B] hover:bg-[#B0603A] disabled:bg-amber-300 text-white px-4 py-2 rounded text-sm font-medium transition"
                >
                  {redeeming ? "..." : "Kullan"}
                </button>
              </div>
              {redeemAmount >= 100 && (
                <p className="text-xs text-green-700 mt-2">≈ {pointsLira.toFixed(2)} ₺ indirim</p>
              )}
              {redeemMessage && (
                <p className={`text-xs mt-2 ${redeemMessage.includes("Hata") ? "text-red-600" : "text-green-700"}`}>{redeemMessage}</p>
              )}
            </div>
          )}

          {/* Total */}
          <div className="bg-white rounded-xl border border-amber-100 p-6 mt-6">
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700 mb-2">
                <span>Seviye indirimi (%{loyalty?.tierDiscountPct})</span>
                <span>-{formatPrice(discount)} ₺</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-amber-900">
              <span>Toplam</span>
              <span>{formatPrice(finalTotal)} ₺</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">+{earnPoints} puan kazanacaksın</p>
            <Link
              href="/odeme"
              className="mt-4 block w-full bg-amber-600 hover:bg-amber-500 text-white text-center py-3 rounded-full font-semibold transition"
            >
              Ödemeye Geç
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
