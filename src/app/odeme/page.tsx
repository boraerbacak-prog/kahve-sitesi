"use client";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/price";
import CartRecommendations from "@/components/CartRecommendations";

export default function OdemePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ shippingName: "", shippingAddress: "", shippingCity: "", shippingPhone: "" });
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [error, setError] = useState("");
  const [loyalty, setLoyalty] = useState<any>(null);
  const [cekirdekKurus, setCekirdekKurus] = useState(0);
  const [showCekirdekInput, setShowCekirdekInput] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/sepet").then(r => r.json()),
        fetch("/api/sadakat/puan").then(r => r.json()).catch(() => null),
        fetch("/api/wallet").then(r => r.json()).catch(() => ({ balance: 0 })),
      ]).then(([cartData, loyaltyData, walletData]) => {
        setItems(cartData.items || []);
        setLoyalty(loyaltyData);
        setWalletBalance(walletData.balance || 0);
        setLoading(false);
      });
    }
  }, [status, router]);

  const rawTotal = items.reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);

  const kahveTotal = useMemo(() => {
    return items
      .filter((i: any) => i.product.category?.type === "kahve" && !i.product.loyaltyExcluded)
      .reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);
  }, [items]);

  const maxCekirdekTL = Math.min(
    (loyalty?.availableTL || 0),
    kahveTotal,
  );

  const maxCekirdekKurus = Math.round(maxCekirdekTL * 100);

  const cekirdekTL = cekirdekKurus / 100;
  const total = Math.max(0, rawTotal - cekirdekTL);

  const placeOrder = async () => {
    if (!form.shippingName || !form.shippingAddress || !form.shippingCity || !form.shippingPhone) {
      setError("Lütfen tüm adres alanlarını doldurun");
      return;
    }
    if (cekirdekKurus > 0 && cekirdekKurus > maxCekirdekKurus) {
      setError(`En fazla ${maxCekirdekTL.toFixed(2)} TL Çekirdek Kredi kullanabilirsiniz.`);
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, paymentMethod, useCekirdekKurus: cekirdekKurus }),
    });
    const data = await res.json();
    if (data.success) {
      const params = new URLSearchParams({ tab: "orders" });
      if (data.estimatedDeliveryDate) params.set("delivery", data.estimatedDeliveryDate);
      router.push(`/hesabim?${params.toString()}`);
    } else {
      setError(data.error || "Bir hata oluştu");
    }
    setSubmitting(false);
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-heading mb-8">Ödeme</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Sol: Adres Formu */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-heading mb-4">Teslimat Adresi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body mb-1">Ad Soyad</label>
                <input type="text" value={form.shippingName} onChange={e => setForm({...form, shippingName: e.target.value})}
                  className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">Adres</label>
                <textarea rows={3} value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})}
                  className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">Şehir</label>
                  <input type="text" value={form.shippingCity} onChange={e => setForm({...form, shippingCity: e.target.value})}
                    className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-body mb-1">Telefon</label>
                  <input type="text" value={form.shippingPhone} onChange={e => setForm({...form, shippingPhone: e.target.value})}
                    className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-heading mb-4">Ödeme Yöntemi</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary/40 transition">
                <input type="radio" name="payment" checked={paymentMethod === "wallet"} onChange={() => setPaymentMethod("wallet")} className="accent-primary" />
                <div>
                  <span className="text-sm font-medium text-heading">Cüzdan</span>
                  <p className="text-xs text-muted mt-0.5">Bakiyen: <strong className="text-heading">{walletBalance.toFixed(2)} ₺</strong>
                    {walletBalance < rawTotal && (
                      <Link href="/cuzdan" className="text-primary hover:underline ml-1">Para Yükle</Link>
                    )}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary/40 transition">
                <input type="radio" name="payment" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} className="accent-primary" />
                <div>
                  <span className="text-sm font-medium text-heading">Kredi Kartı (Stripe)</span>
                  <p className="text-xs text-muted mt-0.5">Kredi kartı ile güvenli ödeme.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Sağ: Sipariş Özeti */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-24 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-heading mb-4">Sipariş Özeti</h2>
              <div className="space-y-3 mb-4">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-body">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium text-heading">{formatPrice(item.product.price * item.quantity)} ₺</span>
                  </div>
                ))}
              </div>
            </div>

            {loyalty && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-bold text-heading mb-2">Çekirdek Kredi</h3>
                <div className="text-xs text-muted mb-3 space-y-1">
                  <p>Kullanılabilir: <span className="font-semibold text-heading">{loyalty.availableTL.toFixed(2)} ₺</span></p>
                  {loyalty.pendingTL > 0 && (
                    <p>Bekleyen: <span className="font-semibold text-heading">{loyalty.pendingTL.toFixed(2)} ₺</span></p>
                  )}
                  {loyalty.monthlyCapTL > 0 && (
                    <div className="pt-1">
                      <div className="flex justify-between text-[10px] text-muted mb-0.5">
                        <span>Aylık kazanım: {loyalty.monthlyEarnedTL.toFixed(2)} TL / {loyalty.monthlyCapTL.toFixed(2)} TL</span>
                        <span>%{loyalty.monthlyProgressPct}</span>
                      </div>
                      <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            loyalty.monthlyProgressPct >= 80 ? "bg-red-500" : loyalty.monthlyProgressPct >= 50 ? "bg-amber-500" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(loyalty.monthlyProgressPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {kahveTotal > 0 && (
                    <>
                      <p>Sepetteki kahve tutarı: <span className="font-semibold text-heading">{formatPrice(kahveTotal)} ₺</span></p>
                      <p className="text-primary font-medium">
                        Bu siparişten %5 ile <strong>{((kahveTotal - cekirdekTL) * 0.05).toFixed(2)} TL</strong> kredi kazanacaksın
                        {cekirdekTL > 0 && (
                          <span className="text-muted font-normal"> ({((kahveTotal - cekirdekTL) * 0.05).toFixed(2)} TL net kahve tutarı üzerinden)</span>
                        )}
                      </p>
                    </>
                  )}
                </div>
                {kahveTotal > 0 && loyalty.availableTL > 0 && !showCekirdekInput && (
                  <button onClick={() => setShowCekirdekInput(true)}
                    className="text-xs text-primary hover:text-primary-hover font-medium transition">
                    + Çekirdek Kredi Kullan
                  </button>
                )}
                {showCekirdekInput && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={maxCekirdekTL} step={0.01}
                        value={cekirdekTL > 0 ? cekirdekTL : ""}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setCekirdekKurus(Math.round(Math.min(val, maxCekirdekTL) * 100));
                        }}
                        placeholder={`0 - ${maxCekirdekTL.toFixed(2)} ₺`}
                        className="w-full border border-border p-2 rounded-lg text-sm focus:outline-none focus:border-primary" />
                      <span className="text-sm text-muted whitespace-nowrap">TL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={maxCekirdekKurus} step={1}
                        value={cekirdekKurus}
                        onChange={e => setCekirdekKurus(parseInt(e.target.value))}
                        className="w-full accent-primary" />
                      <span className="text-xs text-muted min-w-[4rem] text-right">
                        {cekirdekTL.toFixed(2)} ₺
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <button onClick={() => { setCekirdekKurus(0); setShowCekirdekInput(false); }}
                        className="text-xs text-red-500 hover:text-red-700 transition">
                        İptal
                      </button>
                      <button onClick={() => setCekirdekKurus(maxCekirdekKurus)}
                        className="text-xs text-primary hover:text-primary-hover font-medium transition">
                        Maksimum Kullan ({maxCekirdekTL.toFixed(2)} ₺)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-body">
                <span>Ara Toplam</span>
                <span>{formatPrice(rawTotal)} ₺</span>
              </div>
              {cekirdekTL > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Çekirdek Kredi</span>
                  <span>-{formatPrice(cekirdekTL)} ₺</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-heading text-base pt-2 border-t border-border">
                <span>Toplam</span>
                <span>{formatPrice(total)} ₺</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <button onClick={placeOrder} disabled={submitting || items.length === 0}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/40 text-white py-3 rounded-lg font-semibold transition">
              {submitting ? "İşleniyor..." : "Siparişi Tamamla"}
            </button>
            <Link href="/sepet" className="block text-center text-xs text-muted hover:text-primary transition">
              Sepete Dön
            </Link>
            <CartRecommendations cartItems={items} cartTotal={rawTotal} />
          </div>
        </div>
      </div>
    </div>
  );
}
