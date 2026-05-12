"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Sub {
  id: string;
  status: string;
  equipment: string | null;
  deliveryFrequency: string;
  startDate: string;
  plan: { name: string; price: number };
  user: { name: string | null; email: string };
  deliveries: Delivery[];
}

interface Delivery {
  id: string;
  status: string;
  packageCount: number;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shipDate: string | null;
  deliveredDate: string | null;
  roastDate: string | null;
  notes: string | null;
  createdAt: string;
}

export default function AdminAbonelikPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "deliveries">("subscriptions");
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [newDelivery, setNewDelivery] = useState<{ subscriptionId: string; packageCount: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/abonelik/teslimat").then(r => r.json()).then(d => { if (d.deliveries) setDeliveries(d.deliveries); });
    fetch("/api/admin/abonelik/abonelikler").then(r => r.json()).then(d => { if (d.subscriptions) setSubs(d.subscriptions); }).catch(() => {});
  }, []);

  const updateDelivery = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/abonelik/teslimat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) {
      const result = await res.json();
      setDeliveries(prev => prev.map(d => d.id === id ? result.delivery : d));
    }
  };

  const createDelivery = async () => {
    if (!newDelivery) return;
    const res = await fetch("/api/admin/abonelik/teslimat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDelivery),
    });
    if (res.ok) {
      const result = await res.json();
      setDeliveries(prev => [result.delivery, ...prev]);
      setNewDelivery(null);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "pending": return "Hazırlanıyor";
      case "shipped": return "Kargoda";
      case "delivered": return "Teslim Edildi";
      case "cancelled": return "İptal";
      default: return s;
    }
  };

  const stats = {
    total: subs.length,
    active: subs.filter(s => s.status === "active").length,
    paused: subs.filter(s => s.status === "paused").length,
    cancelled: subs.filter(s => s.status === "cancelled").length,
    revenue: subs.filter(s => s.status === "active").reduce((sum, s) => sum + s.plan.price, 0),
    pendingDeliveries: deliveries.filter(d => d.status === "pending").length,
    shippedDeliveries: deliveries.filter(d => d.status === "shipped").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Abonelik Yönetimi</h1>
        <Link href="/admin" className="text-sm text-amber-600 hover:underline">← Admin Panel</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam</p>
          <p className="text-2xl font-bold text-amber-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <p className="text-xs text-green-600 uppercase tracking-wide">Aktif</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-100 p-5">
          <p className="text-xs text-yellow-600 uppercase tracking-wide">Duraklatılmış</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.paused}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <p className="text-xs text-red-600 uppercase tracking-wide">İptal</p>
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Aylık Gelir</p>
          <p className="text-2xl font-bold text-amber-900">{stats.revenue.toLocaleString("tr-TR")}₺</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-100 p-5">
          <p className="text-xs text-yellow-600 uppercase tracking-wide">Hazırlanıyor</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pendingDeliveries}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-5">
          <p className="text-xs text-blue-600 uppercase tracking-wide">Kargoda</p>
          <p className="text-2xl font-bold text-blue-700">{stats.shippedDeliveries}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "subscriptions" ? "bg-amber-600 text-white" : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"}`}>
          Abonelikler
        </button>
        <button onClick={() => setActiveTab("deliveries")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "deliveries" ? "bg-amber-600 text-white" : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"}`}>
          Teslimatlar ({deliveries.length})
        </button>
      </div>

      {activeTab === "subscriptions" && (
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-100">
                  <th className="text-left p-4 text-amber-800 font-medium">Kullanıcı</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Plan</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Durum</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Ekipman</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Sıklık</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Başlangıç</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Teslimat</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((sub) => (
                  <>
                    <tr key={sub.id} className="border-b border-amber-50 hover:bg-amber-50/50 cursor-pointer" onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{sub.user.name || "İsimsiz"}</p>
                        <p className="text-xs text-gray-500">{sub.user.email}</p>
                      </td>
                      <td className="p-4">{sub.plan.name} ({sub.plan.price}₺)</td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          sub.status === "active" ? "bg-green-100 text-green-700" :
                          sub.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {sub.status === "active" ? "Aktif" : sub.status === "paused" ? "Duraklatıldı" : "İptal"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{sub.equipment || "—"}</td>
                      <td className="p-4 text-gray-600">{sub.deliveryFrequency === "monthly" ? "Aylık" : sub.deliveryFrequency === "biweekly" ? "2 Hafta" : "Haftalık"}</td>
                      <td className="p-4 text-gray-600">{new Date(sub.startDate).toLocaleDateString("tr-TR")}</td>
                      <td className="p-4 text-gray-600">
                        {sub.deliveries[0] ? new Date(sub.deliveries[0].createdAt).toLocaleDateString("tr-TR") : "—"}
                      </td>
                    </tr>
                    {expandedSub === sub.id && (
                      <tr key={`${sub.id}-deliveries`}>
                        <td colSpan={7} className="p-4 bg-amber-50/50">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-amber-800">Teslimat Geçmişi</h3>
                            <button onClick={(e) => { e.stopPropagation(); setNewDelivery({ subscriptionId: sub.id, packageCount: sub.deliveries[0]?.packageCount || 1 }); }}
                              className="text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-500">
                              + Yeni Teslimat
                            </button>
                          </div>
                          {sub.deliveries.length === 0 ? (
                            <p className="text-xs text-gray-400">Henüz teslimat yok</p>
                          ) : (
                            <div className="space-y-2">
                              {sub.deliveries.map((d) => (
                                <div key={d.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-amber-100">
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className="font-medium text-gray-700">{new Date(d.createdAt).toLocaleDateString("tr-TR")}</span>
                                    <span className="text-gray-500">{d.packageCount} paket</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusColor(d.status)}`}>{statusLabel(d.status)}</span>
                                    {d.trackingNumber && <span className="text-gray-400">Takip: {d.trackingNumber}</span>}
                                  </div>
                                  <div className="flex gap-2">
                                    {d.status === "pending" && (
                                      <button onClick={(e) => { e.stopPropagation(); updateDelivery(d.id, { status: "shipped" }); }}
                                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500">Kargola</button>
                                    )}
                                    {d.status === "shipped" && (
                                      <button onClick={(e) => { e.stopPropagation(); updateDelivery(d.id, { status: "delivered" }); }}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-500">Teslim Et</button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {subs.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400">Henüz abonelik yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "deliveries" && (
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-100">
                  <th className="text-left p-4 text-amber-800 font-medium">Kullanıcı</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Plan</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Durum</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Paket</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Kavrum</th>
                  <th className="text-left p-4 text-amber-800 font-medium">Takip</th>
                  <th className="text-left p-4 text-amber-800 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                    <td className="p-4 font-medium text-gray-900">—</td>
                    <td className="p-4 text-gray-600">—</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor(d.status)}`}>{statusLabel(d.status)}</span>
                    </td>
                    <td className="p-4 text-gray-600">{d.packageCount} paket</td>
                    <td className="p-4 text-gray-600">{d.roastDate ? new Date(d.roastDate).toLocaleDateString("tr-TR") : "—"}</td>
                    <td className="p-4">
                      <input type="text" placeholder="Takip no" defaultValue={d.trackingNumber || ""}
                        className="w-24 border border-amber-200 p-1 rounded text-xs"
                        onBlur={(e) => { if (e.target.value !== (d.trackingNumber || "")) updateDelivery(d.id, { trackingNumber: e.target.value }); }} />
                    </td>
                    <td className="p-4">
                      <select value={d.status} onChange={(e) => {
                        const updates: Record<string, unknown> = { status: e.target.value };
                        if (e.target.value === "shipped") updates.trackingNumber = d.trackingNumber || `TRK-${Date.now()}`;
                        updateDelivery(d.id, updates);
                      }}
                        className="border border-amber-200 p-1 rounded text-xs">
                        <option value="pending">Hazırlanıyor</option>
                        <option value="shipped">Kargola</option>
                        <option value="delivered">Teslim Et</option>
                        <option value="cancelled">İptal</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400">Henüz teslimat yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {newDelivery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setNewDelivery(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-4">Yeni Teslimat</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paket Sayısı</label>
                <input type="number" value={newDelivery.packageCount} min={1}
                  onChange={e => setNewDelivery({ ...newDelivery, packageCount: parseInt(e.target.value) || 1 })}
                  className="w-full border border-amber-200 p-2 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setNewDelivery(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm text-amber-700">İptal</button>
              <button onClick={createDelivery} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500">Oluştur</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
