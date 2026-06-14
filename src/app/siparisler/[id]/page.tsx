"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import FreshnessTimeline from "@/components/FreshnessTimeline";
import BrewGuide from "@/components/BrewGuide";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  openedAt: string | null;
  consumedAt: string | null;
  rating: number | null;
  review: string | null;
  product: {
    id: string; name: string; slug: string; price: number;
    origin: string | null; process: string | null; roastLevel: string | null;
    roastedAt: string | null; stock: number;
    flavorNotes: string | null; body: string | null; acidity: string | null;
    greenBeanKg: number | null;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDeliveryDate: string | null;
  items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı",
  shipped: "Kargoda", delivered: "Teslim Edildi", cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function SiparisDetayPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/giris"); return; }
    if (authStatus !== "authenticated") return;
    fetch(`/api/siparisler/${id}`)
      .then(r => r.json())
      .then(d => { if (d.order) setOrder(d.order); else router.push("/hesabim"); })
      .catch(() => router.push("/hesabim"))
      .finally(() => setLoading(false));
  }, [id, authStatus, router]);

  const updateItem = async (itemId: string, action: string, extra?: Record<string, unknown>) => {
    setUpdating(itemId);
    await fetch(`/api/siparisler/${id}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const res = await fetch(`/api/siparisler/${id}`);
    const d = await res.json();
    if (d.order) setOrder(d.order);
    setUpdating(null);
  };

  if (loading || authStatus === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/hesabim?tab=orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition mb-8">
        ← Siparişlerime Dön
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Sipariş Detayı</span>
          <h1 className="text-2xl font-bold text-heading mt-1">Sipariş #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted mt-1">{new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          {order.estimatedDeliveryDate && (
            <p className="text-xs text-primary font-medium mt-0.5">Tahmini teslimat: {new Date(order.estimatedDeliveryDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
          )}
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* Teslimat Progress */}
      <div className="bg-white border border-border p-6 mb-8">
        <div className="flex items-center gap-1">
          {[
            { key: "pending", label: "Sipariş Alındı" },
            { key: "confirmed", label: "Onaylandı" },
            { key: "shipped", label: "Kargoda" },
            { key: "delivered", label: "Teslim Edildi" },
          ].map((s, i, arr) => {
            const currentIdx = arr.findIndex(x => x.key === order.status);
            const done = i <= currentIdx && order.status !== "cancelled";
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 ${done ? "text-primary" : "text-gray-300"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                    {i < currentIdx && order.status !== "cancelled" ? "✓" : i + 1}
                  </div>
                  <span className="text-[10px] hidden sm:inline whitespace-nowrap">{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-primary" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ürünler */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-heading">Ürünler</h2>
        {order.items.map((item) => (
          <div key={item.id} className="bg-white border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Link href={`/urunler/${item.product.slug}`} className="text-base font-bold text-heading hover:text-primary transition">{item.product.name}</Link>
                  <p className="text-xs text-muted mt-0.5">{item.product.origin || ""} × {item.quantity} adet · {(item.price * item.quantity).toLocaleString("tr-TR")} ₺</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.consumedAt ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 uppercase tracking-wider">Tükendi</span>
                  ) : item.openedAt ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">Açıldı</span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">Bekliyor</span>
                  )}
                </div>
              </div>

              {/* Tazelik Takvimi */}
              <div className="mb-4">
                <FreshnessTimeline
                  origin={item.product.origin}
                  process={item.product.process}
                  roastLevel={item.product.roastLevel}
                  roastedAt={item.product.roastedAt}
                />
              </div>

              {/* Demleme Önerisi */}
              <BrewGuide
                origin={item.product.origin}
                process={item.product.process}
                roastLevel={item.product.roastLevel}
                body={item.product.body}
              />

              {/* Kullanım Takibi + Geri Bildirim */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-wrap items-center gap-2">
                  {!item.openedAt && !item.consumedAt && (
                    <button onClick={() => updateItem(item.id, "open")} disabled={updating === item.id}
                      className="px-3 py-1.5 text-xs font-medium bg-[#2c1810] text-white hover:bg-[#4a3426] transition disabled:opacity-50">
                      {updating === item.id ? "..." : "📦 Ürünü Açtım"}
                    </button>
                  )}
                  {item.openedAt && !item.consumedAt && (
                    <button onClick={() => updateItem(item.id, "consume")} disabled={updating === item.id}
                      className="px-3 py-1.5 text-xs font-medium bg-[#C4724B] text-white hover:bg-[#B0603A] transition disabled:opacity-50">
                      {updating === item.id ? "..." : "✅ Tükettim"}
                    </button>
                  )}
                </div>

                {/* Geri Bildirim Formu */}
                {item.consumedAt && !item.rating && (
                  <div className="mt-4 p-4 bg-[#f8f6f3] border border-border">
                    <p className="text-xs font-semibold text-heading mb-3">Bu kahveyi nasıl buldun?</p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => updateItem(item.id, "review", { rating: star })}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:scale-110 transition">
                          {star <= (item.rating || 0) ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Yorumun (isteğe bağlı)..." id={`review-${item.id}`}
                        className="flex-1 text-xs border border-border px-2 py-1.5 focus:outline-none focus:border-primary" />
                      <button onClick={() => {
                        const input = document.getElementById(`review-${item.id}`) as HTMLInputElement;
                        updateItem(item.id, "review", { rating: item.rating || 5, review: input.value });
                      }} className="px-3 py-1.5 text-xs font-medium bg-primary text-white hover:bg-primary-hover transition">
                        Gönder
                      </button>
                    </div>
                  </div>
                )}
                {item.rating && (
                  <div className="mt-2 text-xs text-muted">
                    <span>{'⭐'.repeat(item.rating)}</span>
                    {item.review && <span className="ml-2 italic">"{item.review}"</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
