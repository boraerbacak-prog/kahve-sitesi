"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { tl, trDate, trDateTime, esc, htmlExcel, downloadXls } from "@/lib/excel";

interface SubPlan { id: string; name: string; price: number; }
interface SubUser { name: string | null; email: string; }
interface Delivery { id: string; status: string; packageCount: number; trackingNumber: string | null; trackingUrl: string | null; shipDate: string | null; deliveredDate: string | null; roastDate: string | null; notes: string | null; createdAt: string; }
interface Sub {
  id: string; status: string; equipment: string | null; deliveryFrequency: string;
  startDate: string; packageCount: number | null; grindSetting: string | null;
  flavorProfile: string | null; roastPreference: string | null; notes: string | null;
  plan: SubPlan; user: SubUser; deliveries: Delivery[];
}

const statusColor = (s: string) => {
  switch (s) {
    case "active": return "bg-green-100 text-green-700";
    case "paused": return "bg-yellow-100 text-yellow-700";
    case "cancelled": return "bg-red-100 text-red-700";
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "shipped": return "bg-blue-100 text-blue-700";
    case "delivered": return "bg-green-100 text-green-700";
    default: return "bg-gray-100 text-gray-500";
  }
};
const statusLabel = (s: string) => ({
  active: "Aktif", paused: "Duraklatıldı", cancelled: "İptal",
  pending: "Hazırlanıyor", shipped: "Kargoda", delivered: "Teslim Edildi",
}[s] || s);

export default function AdminAbonelikPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "deliveries">("subscriptions");
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [newDelivery, setNewDelivery] = useState<{ subscriptionId: string; packageCount: number } | null>(null);
  const [editingSub, setEditingSub] = useState<Sub | null>(null);

  const load = async () => {
    const [dRes, sRes] = await Promise.all([
      fetch("/api/admin/abonelik/teslimat"),
      fetch("/api/admin/abonelik/abonelikler"),
    ]);
    const d = await dRes.json();
    const s = await sRes.json();
    if (d.deliveries) setAllDeliveries(d.deliveries);
    if (s.subscriptions) setSubs(s.subscriptions);
  };
  useEffect(() => { load(); }, []);

  const updateSub = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/abonelik/abonelikler", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) load();
  };

  const updateDelivery = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/abonelik/teslimat", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) load();
  };

  const createDelivery = async () => {
    if (!newDelivery) return;
    const res = await fetch("/api/admin/abonelik/teslimat", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newDelivery),
    });
    if (res.ok) { load(); setNewDelivery(null); }
  };

  const stats = {
    total: subs.length, active: subs.filter(s => s.status === "active").length,
    paused: subs.filter(s => s.status === "paused").length, cancelled: subs.filter(s => s.status === "cancelled").length,
    revenue: subs.filter(s => s.status === "active").reduce((sum, s) => sum + s.plan.price, 0),
    pendingDeliveries: allDeliveries.filter(d => d.status === "pending").length,
    shippedDeliveries: allDeliveries.filter(d => d.status === "shipped").length,
  };

  const exportSubs = () => {
    const headers = ["Kullanıcı","E-posta","Plan","Fiyat","Durum","Ekipman","Sıklık","Öğütüm","Lezzet","Kavrum","Not","Başlangıç","Teslimat Sayısı"];
    const rows = subs.map(s => [
      esc(s.user.name), esc(s.user.email), esc(s.plan.name), tl(s.plan.price),
      statusLabel(s.status), esc(s.equipment || "—"),
      s.deliveryFrequency === "monthly" ? "Aylık" : s.deliveryFrequency === "biweekly" ? "2 Hafta" : "Haftalık",
      esc(s.grindSetting || "—"), esc(s.flavorProfile || "—"), esc(s.roastPreference || "—"),
      esc(s.notes || "—"), trDate(s.startDate), String(s.deliveries.length),
    ]);
    downloadXls(`abonelikler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Abonelikler", headers, rows));
  };

  const exportDeliveries = () => {
    const headers = ["Kullanıcı","Plan","Durum","Paket","Kavrum","Kargo Tarihi","Teslim Tarihi","Takip No","Not","Oluşturma"];
    const rows = allDeliveries.map(d => {
      const sub = (d as any).subscription;
      return [
        esc(sub?.user?.name || sub?.user?.email || "—"), esc(sub?.plan?.name || "—"),
        statusLabel(d.status), String(d.packageCount),
        d.roastDate ? trDate(d.roastDate) : "—",
        d.shipDate ? trDate(d.shipDate) : "—",
        d.deliveredDate ? trDate(d.deliveredDate) : "—",
        esc(d.trackingNumber || "—"), esc(d.notes || "—"), trDate(d.createdAt),
      ];
    });
    downloadXls(`teslimatlar-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Teslimatlar", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Abonelik Yönetimi</h1>
        <div className="flex gap-2">
          <button onClick={activeTab === "subscriptions" ? exportSubs : exportDeliveries}
            className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
          <Link href="/admin" className="text-sm text-amber-600 hover:underline self-center">← Admin Panel</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 mb-8">
        {[
          { label:"Toplam", count:stats.total, color:"amber" },
          { label:"Aktif", count:stats.active, color:"green" },
          { label:"Duraklatılmış", count:stats.paused, color:"yellow" },
          { label:"İptal", count:stats.cancelled, color:"red" },
          { label:"Aylık Gelir", count:`${tl(stats.revenue)}₺`, color:"amber" },
          { label:"Hazırlanıyor", count:stats.pendingDeliveries, color:"yellow" },
          { label:"Kargoda", count:stats.shippedDeliveries, color:"blue" },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border border-${s.color}-100 p-5`}>
            <p className={`text-xs text-${s.color}-600 uppercase tracking-wide`}>{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-900`}>{s.count}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        {(["subscriptions","deliveries"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? "bg-amber-600 text-white" : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"}`}>
            {tab === "subscriptions" ? "Abonelikler" : `Teslimatlar (${allDeliveries.length})`}
          </button>
        ))}
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
                  <th className="text-left p-4 text-amber-800 font-medium">Aktif</th>
                  <th className="text-left p-4 text-amber-800 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => (
                  <>
                    <tr key={sub.id} className="border-b border-amber-50 hover:bg-amber-50/50 cursor-pointer" onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{sub.user.name || "İsimsiz"}</p>
                        <p className="text-xs text-gray-500">{sub.user.email}</p>
                      </td>
                      <td className="p-4">{sub.plan.name} ({tl(sub.plan.price)}₺)</td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor(sub.status)}`}>
                          {statusLabel(sub.status)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{sub.equipment || "—"}</td>
                      <td className="p-4 text-gray-600">{sub.deliveryFrequency === "monthly" ? "Aylık" : sub.deliveryFrequency === "biweekly" ? "2 Hafta" : "Haftalık"}</td>
                      <td className="p-4 text-gray-600">{sub.deliveries.length}</td>
                      <td className="p-4">
                        <button onClick={(e) => { e.stopPropagation(); setEditingSub(sub); }}
                          className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition">Düzenle</button>
                      </td>
                    </tr>
                    {expandedSub === sub.id && (
                      <tr key={`${sub.id}-deliveries`}>
                        <td colSpan={7} className="p-4 bg-amber-50/50">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-amber-800">Teslimat Geçmişi ({sub.deliveries.length})</h3>
                            <button onClick={(e) => { e.stopPropagation(); setNewDelivery({ subscriptionId: sub.id, packageCount: sub.deliveries[0]?.packageCount || 1 }); }}
                              className="text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-500">+ Yeni Teslimat</button>
                          </div>
                          {sub.deliveries.length === 0 ? (
                            <p className="text-xs text-gray-400">Henüz teslimat yok</p>
                          ) : (
                            <div className="space-y-2">
                              {sub.deliveries.map(d => (
                                <div key={d.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-amber-100">
                                  <div className="flex items-center gap-4 text-xs">
                                    <span className="font-medium text-gray-700">{trDate(d.createdAt)}</span>
                                    {d.roastDate && <span className="text-gray-500">Kavrum: {trDate(d.roastDate)}</span>}
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
              <thead><tr className="bg-amber-50 border-b border-amber-100">
                <th className="text-left p-4 text-amber-800 font-medium">Kullanıcı</th>
                <th className="text-left p-4 text-amber-800 font-medium">Plan</th>
                <th className="text-left p-4 text-amber-800 font-medium">Durum</th>
                <th className="text-left p-4 text-amber-800 font-medium">Paket</th>
                <th className="text-left p-4 text-amber-800 font-medium">Kavrum</th>
                <th className="text-left p-4 text-amber-800 font-medium">Takip</th>
                <th className="text-left p-4 text-amber-800 font-medium">Not</th>
                <th className="text-left p-4 text-amber-800 font-medium">İşlem</th>
              </tr></thead>
              <tbody>
                {allDeliveries.map(d => {
                  const sub = (d as any).subscription;
                  return (
                    <tr key={d.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                      <td className="p-4 font-medium text-gray-900">{sub?.user?.name || sub?.user?.email || "—"}</td>
                      <td className="p-4 text-gray-600">{sub?.plan?.name || "—"}</td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor(d.status)}`}>{statusLabel(d.status)}</span>
                      </td>
                      <td className="p-4 text-gray-600">{d.packageCount} paket</td>
                      <td className="p-4 text-gray-600">{d.roastDate ? trDate(d.roastDate) : "—"}</td>
                      <td className="p-4">
                        <input type="text" placeholder="Takip no" defaultValue={d.trackingNumber || ""}
                          className="w-24 border border-amber-200 p-1 rounded text-xs"
                          onBlur={(e) => { if (e.target.value !== (d.trackingNumber || "")) updateDelivery(d.id, { trackingNumber: e.target.value }); }} />
                      </td>
                      <td className="p-4">
                        <input type="text" placeholder="Not" defaultValue={d.notes || ""}
                          className="w-24 border border-amber-200 p-1 rounded text-xs"
                          onBlur={(e) => { if (e.target.value !== (d.notes || "")) updateDelivery(d.id, { notes: e.target.value }); }} />
                      </td>
                      <td className="p-4">
                        <select value={d.status} onChange={(e) => {
                          const updates: Record<string, unknown> = { status: e.target.value };
                          if (e.target.value === "shipped") updates.trackingNumber = d.trackingNumber || `TRK-${Date.now()}`;
                          updateDelivery(d.id, updates);
                        }} className="border border-amber-200 p-1 rounded text-xs">
                          <option value="pending">Hazırlanıyor</option>
                          <option value="shipped">Kargola</option>
                          <option value="delivered">Teslim Et</option>
                          <option value="cancelled">İptal</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {allDeliveries.length === 0 && (<tr><td colSpan={8} className="p-8 text-center text-gray-400">Henüz teslimat yok</td></tr>)}
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

      {editingSub && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditingSub(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-4">Abonelik Düzenle</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">Kullanıcı</label>
                <p className="font-medium">{editingSub.user.name} ({editingSub.user.email})</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Plan</label>
                <p className="font-medium">{editingSub.plan.name} ({tl(editingSub.plan.price)}₺)</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Durum</label>
                <select value={editingSub.status} onChange={e => setEditingSub({...editingSub, status: e.target.value })}
                  className="w-full border border-amber-200 p-2 rounded text-sm">
                  <option value="active">Aktif</option>
                  <option value="paused">Duraklatıldı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Sıklık</label>
                <select value={editingSub.deliveryFrequency} onChange={e => setEditingSub({...editingSub, deliveryFrequency: e.target.value })}
                  className="w-full border border-amber-200 p-2 rounded text-sm">
                  <option value="monthly">Aylık</option>
                  <option value="biweekly">2 Hafta</option>
                  <option value="weekly">Haftalık</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Ekipman</label>
                <input type="text" value={editingSub.equipment || ""} onChange={e => setEditingSub({...editingSub, equipment: e.target.value })}
                  className="w-full border border-amber-200 p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Paket Sayısı</label>
                <input type="number" value={editingSub.packageCount || 1} min={1} onChange={e => setEditingSub({...editingSub, packageCount: parseInt(e.target.value) || 1 })}
                  className="w-full border border-amber-200 p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Öğütüm</label>
                <input type="text" value={editingSub.grindSetting || ""} onChange={e => setEditingSub({...editingSub, grindSetting: e.target.value })}
                  className="w-full border border-amber-200 p-2 rounded text-sm" placeholder="whole/ground/french press..." />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Lezzet Profili</label>
                <input type="text" value={editingSub.flavorProfile || ""} onChange={e => setEditingSub({...editingSub, flavorProfile: e.target.value })}
                  className="w-full border border-amber-200 p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Kavrum</label>
                <input type="text" value={editingSub.roastPreference || ""} onChange={e => setEditingSub({...editingSub, roastPreference: e.target.value })}
                  className="w-full border border-amber-200 p-2 rounded text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-500 mb-1">Notlar</label>
                <textarea value={editingSub.notes || ""} onChange={e => setEditingSub({...editingSub, notes: e.target.value })}
                  className="w-full border border-amber-200 p-2 rounded text-sm" rows={2} />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditingSub(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm">İptal</button>
              <button onClick={async () => {
                await updateSub(editingSub.id, {
                  status: editingSub.status, deliveryFrequency: editingSub.deliveryFrequency,
                  equipment: editingSub.equipment, packageCount: editingSub.packageCount,
                  grindSetting: editingSub.grindSetting, flavorProfile: editingSub.flavorProfile,
                  roastPreference: editingSub.roastPreference, notes: editingSub.notes,
                });
                setEditingSub(null);
              }} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
