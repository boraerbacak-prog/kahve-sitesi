"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: string; quantity: number; price: number;
  product: { id: string; name: string; slug: string };
}

interface Order {
  id: string; status: string; total: number; createdAt: string;
  shippingName: string | null;
  user: { id: string; name: string | null; email: string };
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  confirmed: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", shipped: "Kargoda", delivered: "Teslim Edildi", cancelled: "İptal",
};

export default function AdminSiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders").then(r => r.json()).then(d => { if (d.orders) setOrders(d.orders); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Siparişler ({orders.length})</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${filter === s ? "bg-amber-600 text-white border-amber-600" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
          >
            {s ? statusLabels[s] : "Tümü"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Sipariş</th>
            <th className="text-left p-4">Müşteri</th>
            <th className="text-left p-4">Ürünler</th>
            <th className="text-left p-4">Tutar</th>
            <th className="text-left p-4">Tarih</th>
            <th className="text-left p-4">Durum</th>
          </tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                <td className="p-4"><p className="font-medium text-gray-900">{o.user.name || "İsimsiz"}</p><p className="text-xs text-gray-500">{o.user.email}</p></td>
                <td className="p-4 text-gray-600">
                  {o.items.map(i => i.product.name).join(", ").slice(0, 50)}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
                </td>
                <td className="p-4 font-semibold text-gray-900">{o.total.toLocaleString("tr-TR")}₺</td>
                <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded border-0 ${statusColors[o.status] || "bg-gray-100"}`}
                  >
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Sipariş yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
