"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  packageCount: number;
  packageSize: number;
}

interface DeliveryItem {
  id: string;
  product: { id: string; name: string; slug: string };
  quantity: number;
}

interface Delivery {
  id: string;
  status: string;
  roastDate: string | null;
  shipDate: string | null;
  deliveredDate: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  packageCount: number;
  notes: string | null;
  rating: number | null;
  createdAt: string;
  items: DeliveryItem[];
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  nextDelivery: string | null;
  equipment: string | null;
  grindSetting: string | null;
  flavorProfile: string | null;
  deliveryFrequency: string;
  notes: string | null;
  plan: Plan;
  deliveries: Delivery[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Aktif", color: "text-green-600" },
  paused: { label: "Duraklatıldı", color: "text-yellow-600" },
  cancelled: { label: "İptal Edildi", color: "text-red-600" },
};

const deliveryStatusLabels: Record<string, string> = {
  pending: "Hazırlanıyor",
  roasting: "Kavruluyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
};

export default function YonetimPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelSubId, setCancelSubId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    fetch("/api/abonelik/my")
      .then((r) => r.json())
      .then((d) => {
        if (d.subscriptions) setSubscriptions(d.subscriptions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const handleCancel = async () => {
    if (!cancelSubId) return;
    if (!cancelReason.trim()) {
      setCancelError("İptal nedeninizi yazmalısınız.");
      return;
    }
    setActionLoading(cancelSubId);
    const res = await fetch("/api/abonelik/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: cancelSubId, reason: cancelReason.trim() }),
    });
    if (!res.ok) {
      setCancelError("İptal sırasında bir hata oluştu.");
      setActionLoading(null);
      return;
    }
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === cancelSubId ? { ...s, status: "cancelled" } : s))
    );
    setCancelSubId(null);
    setCancelReason("");
    setCancelError("");
    setActionLoading(null);
  };

  const handlePause = async (subId: string, pause: boolean) => {
    setActionLoading(subId);
    await fetch("/api/abonelik/pause", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: subId, pause }),
    });
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subId ? { ...s, status: pause ? "paused" : "active" } : s
      )
    );
    setActionLoading(null);
  };

  const handleRating = async (deliveryId: string, rating: number) => {
    await fetch("/api/abonelik/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryId, rating }),
    });
    setSubscriptions((prev) =>
      prev.map((s) => ({
        ...s,
        deliveries: s.deliveries.map((d) =>
          d.id === deliveryId ? { ...d, rating } : d
        ),
      }))
    );
  };

  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-heading mb-4">Abonelik Yönetimi</h1>
        <p className="text-body mb-8">Aboneliğinizi yönetmek için giriş yapmalısınız.</p>
        <button
          onClick={() => signIn()}
          className="bg-heading hover:bg-[#333] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-6xl animate-pulse">☕</span>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <span className="text-6xl block mb-6">📦</span>
        <h1 className="text-2xl font-bold text-heading mb-4">Aktif Aboneliğiniz Yok</h1>
        <p className="text-body mb-8">
          Henüz bir aboneliğiniz bulunmuyor. Taze kahveleri kaçırmayın!
        </p>
        <Link
          href="/abonelik"
          className="bg-primary hover:bg-primary-hover text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition inline-block"
        >
          Abonelik Paketlerini İncele
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Yönetim</span>
          <h1 className="text-3xl font-bold text-heading mt-2">Aboneliklerim</h1>
        </div>
        <Link
          href="/abonelik"
          className="text-sm text-primary hover:text-primary-hover transition"
        >
          + Yeni Abonelik
        </Link>
      </div>

      {subscriptions.map((sub) => {
        const st = statusLabels[sub.status] || { label: sub.status, color: "text-gray-600" };
        const nextDelivery = sub.nextDelivery
          ? new Date(sub.nextDelivery).toLocaleDateString("tr-TR")
          : "Belirlenmedi";
        const latestDelivery = sub.deliveries[0];

        return (
          <div key={sub.id} className="bg-white border border-border mb-6">
            <div className="p-6 sm:p-8 border-b border-border">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-heading">
                    {sub.plan.name}
                  </h2>
                  <p className="text-sm text-body mt-1">
                    {sub.plan.packageCount} paket ({sub.plan.packageSize}g) · {sub.plan.price} ₺/ay
                  </p>
                </div>
                <span className={`text-xs font-semibold tracking-wide uppercase ${st.color}`}>
                  {st.label}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted font-medium mb-1">Profil</p>
                <div className="space-y-1 text-sm text-body">
                  {sub.equipment && <p>Ekipman: {equipLabel(sub.equipment)}</p>}
                  {sub.grindSetting && <p>Öğütme: {grindLabel(sub.grindSetting)}</p>}
                  {sub.flavorProfile && <p>Lezzet: {flavorLabel(sub.flavorProfile)}</p>}
                  <p>Sıklık: {freqLabel(sub.deliveryFrequency)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted font-medium mb-1">Teslimat</p>
                <div className="space-y-1 text-sm text-body">
                  <p>Başlangıç: {new Date(sub.startDate).toLocaleDateString("tr-TR")}</p>
                  <p>Sonraki: {nextDelivery}</p>
                  {latestDelivery && (
                    <p>Durum: {deliveryStatusLabels[latestDelivery.status] || latestDelivery.status}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 items-start">
                <p className="text-xs tracking-[0.2em] uppercase text-muted font-medium mb-1">İşlemler</p>
                {sub.status === "active" && (
                  <>
                    <button
                      onClick={() => handlePause(sub.id, true)}
                      disabled={actionLoading === sub.id}
                      className="text-sm text-yellow-600 hover:text-yellow-700 transition"
                    >
                      Duraklat
                    </button>
                    <button
                      onClick={() => setCancelSubId(sub.id)}
                      className="text-sm text-red-600 hover:text-red-700 transition"
                    >
                      İptal Et
                    </button>
                  </>
                )}
                {sub.status === "paused" && (
                  <button
                    onClick={() => handlePause(sub.id, false)}
                    disabled={actionLoading === sub.id}
                    className="text-sm text-green-600 hover:text-green-700 transition"
                  >
                    Devam Ettir
                  </button>
                )}
                <Link
                  href="/ai-barista"
                  className="text-sm text-primary hover:text-primary-hover transition"
                >
                  AI Barista ile Yönet
                </Link>
              </div>
            </div>

            {sub.deliveries.length > 0 && (
              <div className="border-t border-border p-6 sm:p-8">
                <p className="text-xs tracking-[0.2em] uppercase text-muted font-medium mb-4">Teslimat Geçmişi</p>
                <div className="space-y-3">
                  {sub.deliveries.map((del) => (
                    <div key={del.id} className="flex items-center justify-between gap-4 p-3 bg-page-hover">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            del.status === "delivered" ? "bg-green-500" :
                            del.status === "shipped" ? "bg-blue-500" :
                            del.status === "roasting" ? "bg-yellow-500" : "bg-gray-400"
                          }`} />
                          <span className="text-sm font-medium text-heading">{deliveryStatusLabels[del.status] || del.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted">
                          <span>{new Date(del.createdAt).toLocaleDateString("tr-TR")}</span>
                          {del.roastDate && <span>Kavrum: {new Date(del.roastDate).toLocaleDateString("tr-TR")}</span>}
                          {del.items.length > 0 && (
                            <span>{del.items.map((i) => i.product.name).join(", ")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {del.status === "delivered" && !del.rating && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRating(del.id, star)}
                                className="text-lg hover:scale-110 transition text-gray-300 hover:text-yellow-500"
                              >
                                ☆
                              </button>
                            ))}
                          </div>
                        )}
                        {del.rating && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-sm ${star <= del.rating! ? "text-yellow-500" : "text-gray-300"}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {cancelSubId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => { setCancelSubId(null); setCancelReason(""); setCancelError(""); }}>
          <div className="bg-white p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-heading mb-2">Aboneliği İptal Et</h3>
            <p className="text-sm text-body mb-4">Aboneliğinizi neden iptal etmek istiyorsunuz?</p>
            <textarea
              value={cancelReason}
              onChange={e => { setCancelReason(e.target.value); setCancelError(""); }}
              rows={4}
              className="w-full border border-border px-4 py-3 text-sm bg-white focus:outline-none focus:border-primary transition resize-none"
              placeholder="İptal nedeninizi yazın..."
            />
            {cancelError && <p className="text-xs text-red-600 mt-1">{cancelError}</p>}
            <div className="flex gap-3 mt-5 justify-end">
              <button
                onClick={() => { setCancelSubId(null); setCancelReason(""); setCancelError(""); }}
                className="px-5 py-2.5 text-sm text-body border border-border hover:text-heading transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading === cancelSubId}
                className="px-5 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === cancelSubId ? "İptal Ediliyor..." : "İptal Talebini Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function equipLabel(v: string): string {
  const m: Record<string, string> = {
    v60: "V60 / Pour Over", "french-press": "French Press", espresso: "Espresso",
    moka: "Moka Pot", aeropress: "Aeropress", cezve: "Cezve",
    filter: "Filtre Makine", "cold-brew": "Soğuk Demleme",
  };
  return m[v] || v;
}

function grindLabel(v: string): string {
  const m: Record<string, string> = { fine: "İnce", "medium-fine": "Orta-İnce", medium: "Orta", coarse: "Kalın" };
  return m[v] || v;
}

function flavorLabel(v: string): string {
  const m: Record<string, string> = { fruity: "Meyvemsi", sweet: "Dengeli", bold: "Çikolata" };
  return m[v] || v;
}

function freqLabel(v: string): string {
  const m: Record<string, string> = { monthly: "Aylık", biweekly: "2 Haftada 1", weekly: "Haftalık" };
  return m[v] || v;
}
