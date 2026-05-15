"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; slug: string };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  plan: { name: string; price: number; packageCount: number; packageSize: number };
}

interface LoyaltyData {
  points: number;
  tier: string;
  totalSpent: number;
  tierDiscountPct: number;
}

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function HesabimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "subscriptions" | "profile" | "loyalty">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/siparislerim").then(r => r.json()).then(d => { if (d.orders) setOrders(d.orders); });
    fetch("/api/abonelik/my").then(r => r.json()).then(d => { if (d.subscriptions) setSubscriptions(d.subscriptions); });
    fetch("/api/sadakat/puan").then(r => r.json()).then(d => { if (d.points !== undefined) setLoyalty(d); }).catch(() => {});
  }, []);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-6xl animate-pulse">☕</span></div>;
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Hesabım</span>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mt-2">Merhaba, {session.user?.name || "Kahvesever"}</h1>
        </div>
        <div className="flex gap-2">
          {session.user?.email === "admin@kahveci.com" && (
            <Link href="/admin" className="text-xs bg-[#1a1a1a] text-white px-4 py-2 uppercase tracking-wider hover:bg-[#333] transition">
              Admin Paneli
            </Link>
          )}
          <Link href="/abonelik/yonetim" className="text-xs bg-[#C4724B] text-white px-4 py-2 uppercase tracking-wider hover:bg-[#B0603A] transition">
            Aboneliğim
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs border border-red-200 text-red-600 px-4 py-2 uppercase tracking-wider hover:bg-red-50 transition">
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[#e5e0d8] pb-4 overflow-x-auto">
        {[
          { key: "orders", label: "Siparişlerim", count: orders.length },
          { key: "subscriptions", label: "Aboneliklerim", count: subscriptions.length },
          { key: "loyalty", label: "⭐ Sadakat" },
          { key: "profile", label: "Profil" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`text-sm font-medium pb-4 -mb-4 border-b-2 transition whitespace-nowrap ${
              tab === t.key ? "border-[#C4724B] text-[#C4724B]" : "border-transparent text-[#8c8c8c] hover:text-[#1a1a1a]"
            }`}>
            {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">📦</span>
              <p className="text-[#4a4a4a] mb-4">Henüz siparişiniz yok.</p>
              <Link href="/urunler" className="text-[#C4724B] hover:text-[#B0603A] text-sm font-medium">Alışverişe Başla →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-[#e5e0d8] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">Sipariş #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-[#8c8c8c]">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-[#4a4a4a]">{item.product.name} × {item.quantity}</span>
                        <span className="text-[#1a1a1a] font-medium">{(item.price * item.quantity).toLocaleString("tr-TR")}₺</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#e5e0d8] mt-4 pt-3 flex justify-between">
                    <span className="text-sm font-bold text-[#1a1a1a]">Toplam</span>
                    <span className="text-sm font-bold text-[#1a1a1a]">{order.total.toLocaleString("tr-TR")}₺</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "subscriptions" && (
        <div>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">📅</span>
              <p className="text-[#4a4a4a] mb-4">Aktif aboneliğiniz bulunmuyor.</p>
              <Link href="/abonelik" className="text-[#C4724B] hover:text-[#B0603A] text-sm font-medium">Abonelik Paketlerini İncele →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white border border-[#e5e0d8] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-[#1a1a1a]">{sub.plan.name}</p>
                      <p className="text-sm text-[#4a4a4a]">{sub.plan.packageCount} paket · {sub.plan.price}₺/ay</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded ${
                      sub.status === "active" ? "bg-green-100 text-green-700" :
                      sub.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {sub.status === "active" ? "Aktif" : sub.status === "paused" ? "Duraklatıldı" : "İptal"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link href="/abonelik/yonetim" className="text-xs text-[#C4724B] hover:text-[#B0603A] font-medium">Detaylar →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "loyalty" && (
        <div>
          {loyalty ? (
            <div className="space-y-4">
              <div className="bg-white border border-[#e5e0d8] p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-amber-600 uppercase tracking-wide">Seviyen</p>
                    <p className={`text-2xl font-bold mt-1 capitalize ${
                      loyalty.tier === "gold" ? "text-yellow-600" : loyalty.tier === "silver" ? "text-gray-500" : "text-amber-700"
                    }`}>{loyalty.tier}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-600 uppercase tracking-wide">Puanın</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">{loyalty.points}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Harcama</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">{loyalty.totalSpent.toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-600 uppercase tracking-wide">İndirim</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">%{loyalty.tierDiscountPct}</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Link href="/sadakat" className="text-[#C4724B] hover:text-[#B0603A] text-sm font-medium">Tüm detaylar →</Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">⭐</span>
              <p className="text-[#4a4a4a] mb-4">Henüz puan bilgin bulunmuyor. Alışveriş yapmaya başla!</p>
              <Link href="/urunler" className="text-[#C4724B] hover:text-[#B0603A] text-sm font-medium">Alışverişe Başla →</Link>
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="bg-white border border-[#e5e0d8] p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-6">Profil Bilgilerim</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8c8c8c] uppercase tracking-wider mb-1">Ad Soyad</label>
              <p className="text-sm font-medium text-[#1a1a1a]">{session.user?.name || "—"}</p>
            </div>
            <div>
              <label className="block text-xs text-[#8c8c8c] uppercase tracking-wider mb-1">E-posta</label>
              <p className="text-sm font-medium text-[#1a1a1a]">{session.user?.email}</p>
            </div>
          </div>
          <div className="border-t border-[#e5e0d8] mt-6 pt-6">
            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg hover:bg-red-100 transition">
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
