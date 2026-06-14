"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const PRESETS = [500, 1000, 2500, 5000];

const typeLabel: Record<string, string> = {
  top_up: "Para Yükleme",
  payment: "Sipariş Ödemesi",
  refund: "İade",
  admin_adjust: "Düzenleme",
  earn: "Çekirdek Kredi",
  redeem: "Kredi Kullanma",
  referral: "Referans",
};

const statusColor: Record<string, string> = {
  completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

interface SpecialLot {
  id: string;
  name: string;
  slug: string;
  origin: string | null;
  region: string | null;
  process: string | null;
  flavorNotes: string | null;
  roastLevel: string | null;
  price: number;
  images: string;
  grade: string | null;
  segment: string;
}

function getProductImage(slug: string): string {
  const imageMap: Record<string, string> = {
    "ethiopia-sidamo-g2": "Gemini_Generated_Image_445e1s445e1s445e",
    "ethiopia-sidamo-g4": "Gemini_Generated_Image_c7t8k5c7t8k5c7t8",
    "ethiopia-lekempt-g4": "Gemini_Generated_Image_dvivc9dvivc9dviv",
    "guatemala-shb-18-sc": "Gemini_Generated_Image_g74yvng74yvng74y",
    "colombia-supremo-18-sc": "Gemini_Generated_Image_u229vnu229vnu229",
    "brasil-mogiana": "Gemini_Generated_Image_v621nbv621nbv621",
    "ethiopia-yirga-koke-honey-g1": "Gemini_Generated_Image_jwubysjwubysjwub",
    "colombia-la-roca-pink-bourbon": "Gemini_Generated_Image_vzulafvzulafvzul",
  };
  const key = imageMap[slug] || "rostello";
  return `/products/${key}.png`;
}

export default function CuzdanPage() {
  const { data: session, status: authStatus } = useSession();
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTx, setWalletTx] = useState<any[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [specialLots, setSpecialLots] = useState<SpecialLot[]>([]);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpMsg, setTopUpMsg] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchData = () => {
    fetch("/api/wallet")
      .then(r => r.json())
      .then(d => {
        setWalletBalance(d.balance || 0);
        setWalletTx(d.transactions || []);
      })
      .catch(() => {});
    fetch("/api/sadakat/detay")
      .then(r => r.json())
      .then(d => { if (d.availableTL !== undefined) setLoyaltyData(d); })
      .catch(() => {});
    fetch("/api/admin/products")
      .then(r => r.json())
      .then(d => {
        if (d.products) {
          const special = d.products
            .filter((p: any) => p.segment === "specialty" || p.segment === "bundle")
            .sort((a: any, b: any) => (a.segment === "bundle" ? -1 : 1))
            .slice(0, 4);
          setSpecialLots(special);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (authStatus === "authenticated") fetchData();
  }, [authStatus]);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 50) { setTopUpMsg("Minimum 50 TL"); return; }
    setTopUpLoading(true);
    setTopUpMsg("");
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.success) {
        setTopUpMsg(data.message || "Talep alındı");
        setTopUpAmount("");
        fetchData();
      } else {
        setTopUpMsg(data.error || "Hata: " + res.status);
      }
    } catch {
      setTopUpMsg("Sunucu hatası, lütfen sayfayı yenileyip tekrar dene");
    }
    setTopUpLoading(false);
  };

  if (authStatus === "loading") return (
    <div className="max-w-5xl mx-auto px-4 py-24 text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!session) return (
    <div className="max-w-5xl mx-auto px-4 py-24 text-center">
      <p className="text-xl text-heading font-medium mb-4">Çekirdek Cüzdan'ı görüntülemek için giriş yapın</p>
      <Link href="/giris" className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition">Giriş Yap</Link>
    </div>
  );

  const creditTL = loyaltyData?.availableTL || 0;
  const pendingCreditTL = loyaltyData?.pendingTL || 0;
  const totalValue = walletBalance + creditTL;

  const allTransactions = [
    ...(loyaltyData?.transactions || []).map((tx: any) => ({
      ...tx,
      _type: "loyalty",
      _amountTL: (tx.amount || 0) / 100,
      _date: tx.createdAt,
    })),
    ...walletTx.map((tx: any) => ({
      ...tx,
      _type: "wallet",
      _amountTL: tx.amount,
      _date: tx.createdAt,
    })),
  ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.2em] uppercase text-primary font-medium mb-2">Finans</p>
        <h1 className="text-3xl font-bold text-heading tracking-tight">Çekirdek Cüzdan</h1>
        <p className="text-sm text-muted mt-1">Bakiyeni ve kredilerini tek ekranda yönet</p>
      </div>

      {/* Portfolio Overview */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] rounded-2xl p-8 mb-8 overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.02] rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Toplam Portföy Değeri</p>
            <span className="text-[10px] text-emerald-400/60 bg-emerald-400/5 px-2 py-0.5 rounded-full border border-emerald-400/10">
              {creditTL > 0 ? "+" + creditTL.toFixed(2) + " TL kredi" : "—"}
            </span>
          </div>
          <p className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6">
            {totalValue.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xl font-normal text-white/30 ml-3">TL</span>
          </p>
          <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Cüzdan</p>
                <p className="text-lg font-bold text-white">{walletBalance.toFixed(2)} <span className="text-xs font-normal text-white/40">TL</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Çekirdek Kredi</p>
                <p className="text-lg font-bold text-white">{creditTL.toFixed(2)} <span className="text-xs font-normal text-white/40">TL</span></p>
              </div>
            </div>
            {loyaltyData?.tier && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 text-sm font-bold uppercase">{loyaltyData.tier.slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Seviye</p>
                  <p className="text-lg font-bold text-white capitalize">{loyaltyData.tier}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* Wallet Card */}
        <div className="bg-white border border-[#e5e0d8] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium">Cüzdan Bakiyesi</p>
              <p className="text-3xl font-bold text-heading mt-1">
                {walletBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                <span className="text-base font-normal text-muted ml-2">TL</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(amount => (
                <button key={amount} onClick={() => setTopUpAmount(String(amount))}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition border ${
                    topUpAmount === String(amount)
                      ? "bg-heading text-white border-heading"
                      : "bg-white text-heading border-[#e5e0d8] hover:border-heading/30"
                  }`}>
                  {amount.toLocaleString("tr-TR")} TL
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">₺</span>
                <input type="number" min={50} max={50000} step={10} value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)} placeholder="Özel tutar"
                  className="w-full pl-7 pr-3 py-2.5 border border-[#e5e0d8] rounded-lg text-sm text-heading placeholder:text-muted/50 focus:outline-none focus:border-primary transition bg-white" />
              </div>
              <button onClick={handleTopUp} disabled={topUpLoading}
                className="bg-heading hover:bg-[#333] disabled:bg-heading/40 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap">
                {topUpLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </span>
                ) : "Yükle"}
              </button>
            </div>
          </div>

          {topUpMsg && (
            <div className="p-3 bg-[#f8f6f3] border border-[#e5e0d8] rounded-lg">
              <p className="text-xs text-heading/70 whitespace-pre-line leading-relaxed">{topUpMsg}</p>
            </div>
          )}
        </div>

        {/* Credit Card */}
        <div className="bg-white border border-[#e5e0d8] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-medium">Çekirdek Kredi</p>
              <p className="text-3xl font-bold text-heading mt-1">
                {creditTL.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                <span className="text-base font-normal text-muted ml-2">TL</span>
              </p>
              {pendingCreditTL > 0 && (
                <p className="text-[11px] text-amber-600 mt-0.5">
                  <span className="font-medium">{pendingCreditTL.toFixed(2)} TL</span> bekleyen kredi
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f8f6f3] rounded-xl p-3">
                <p className="text-[10px] text-muted uppercase tracking-wider">Kazanım Oranı</p>
                <p className="text-lg font-bold text-heading">%{loyaltyData?.earnRate || 5}</p>
              </div>
              <div className="bg-[#f8f6f3] rounded-xl p-3">
                <p className="text-[10px] text-muted uppercase tracking-wider">Toplam Harcama</p>
                <p className="text-lg font-bold text-heading">{(loyaltyData?.totalSpent || 0).toLocaleString("tr-TR")} TL</p>
              </div>
            </div>

            {loyaltyData?.monthlyCapTL > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted uppercase tracking-wider">Aylık Kredi Limiti</p>
                  <p className="text-[10px] text-muted">{(loyaltyData?.monthlyEarnedTL || 0).toFixed(2)} / {(loyaltyData?.monthlyCapTL || 0).toFixed(0)} TL</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${(loyaltyData?.monthlyProgressPct || 0) >= 80 ? "bg-red-500" : (loyaltyData?.monthlyProgressPct || 0) >= 50 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(loyaltyData?.monthlyProgressPct || 0, 100)}%` }} />
                </div>
              </div>
            )}

            {loyaltyData?.referralCode && (
              <div className="flex items-center gap-2 pt-2">
                <p className="text-[10px] text-muted">Referans Kodu:</p>
                <code className="text-xs font-bold tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">{loyaltyData.referralCode}</code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Special Lots Vitrin */}
      {specialLots.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-heading">Özel Lot Kahveler</h2>
              <p className="text-xs text-muted mt-0.5">Sınırlı hasat seçkileri, cüzdanınla hemen keşfet</p>
            </div>
            <Link href="/urunler?segment=specialty" className="text-xs text-primary hover:text-primary-hover font-medium hover:underline">Tümünü Gör →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {specialLots.map((lot) => {
              return (
                <Link key={lot.id} href={"/urunler/" + lot.slug} className="group bg-white border border-[#e5e0d8] rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="aspect-[4/3] relative bg-[#f8f6f3] overflow-hidden">
                    <Image src={getProductImage(lot.slug)} alt={lot.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                    {lot.grade && (
                      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-bold bg-white/90 text-heading px-2 py-0.5 rounded-full backdrop-blur-sm">{lot.grade}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-heading leading-snug line-clamp-2 group-hover:text-primary transition">{lot.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {lot.origin && <span className="text-[10px] text-muted">{lot.origin}</span>}
                      {lot.origin && lot.process && <span className="text-[10px] text-muted">·</span>}
                      {lot.process && <span className="text-[10px] text-muted">{lot.process}</span>}
                    </div>
                    <p className="text-xs font-bold text-heading mt-2">{lot.price.toLocaleString("tr-TR")} TL</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Combined Transaction History */}
      {allTransactions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-heading">İşlem Geçmişi</h2>
            <span className="text-[11px] text-muted">{allTransactions.length} işlem</span>
          </div>
          <div className="space-y-px bg-[#e5e0d8] rounded-2xl overflow-hidden">
            {allTransactions.slice(0, 30).map((tx: any) => {
              const isCredit = tx._type === "loyalty";
              const isPositive = tx._type === "loyalty" ? tx.amount > 0 : tx.amount >= 0;
              return (
                <div key={tx.id + tx._type} className="bg-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                      isCredit ? "bg-amber-50 text-amber-600" : isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}>
                      {isCredit ? "✓" : isPositive ? "↑" : "↓"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-heading">
                        {isCredit ? (typeLabel[tx.type] || tx.type) + (tx.status === "pending" ? " (bekliyor)" : "") : (typeLabel[tx.type] || "İşlem")}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted">{new Date(tx._date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {isCredit ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-amber-50 text-amber-600 border-amber-200">Kredi</span>
                        ) : (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor[tx.status] || "text-muted bg-page-hover border-border"}`}>
                            {tx.status === "completed" ? "Cüzdan" : tx.status === "pending" ? "Bekliyor" : tx.status}
                          </span>
                        )}
                      </div>
                      {tx.note && <p className="text-[11px] text-muted mt-0.5">{tx.note}</p>}
                    </div>
                  </div>
                  <p className={`text-sm font-semibold tabular-nums ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                    {isPositive ? "+" : ""}
                    {tx._amountTL.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allTransactions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted">Henüz işlem bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
