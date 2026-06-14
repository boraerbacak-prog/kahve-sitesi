"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate, tl } from "@/lib/excel";

interface ReturnRequest {
  id: string; reason: string; status: string;
  cargoCompany: string | null; trackingNumber: string | null;
  notes: string | null; createdAt: string;
  order: {
    id: string; total: number; status: string;
    user: { name: string | null; email: string };
    items: { product: { name: string }; quantity: number; price: number }[];
  };
}

const statusLabels: Record<string, string> = {
  pending: "Bekliyor", approved: "Onaylandı", picked_up: "Teslim Alındı", refunded: "İade Edildi", rejected: "Reddedildi",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  picked_up: "bg-purple-100 text-purple-700",
  refunded: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const cargoCompanies = [
  { value: "yurtici", label: "Yurtiçi Kargo" },
  { value: "mng", label: "MNG Kargo" },
  { value: "aras", label: "Aras Kargo" },
  { value: "ptt", label: "PTT Kargo" },
  { value: "other", label: "Diğer" },
];

export default function AdminIadePage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/returns").then(r => r.json()).then(d => { if (d.returns) setReturns(d.returns); });
  }, []);

  const updateReturn = async (id: string, data: any) => {
    const res = await fetch("/api/admin/returns", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) {
      const d = await res.json();
      setReturns(prev => prev.map(r => r.id === id ? d.return : r));
      setNotifMsg("İade talebi güncellendi ✓");
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const filtered = filter ? returns.filter(r => r.status === filter) : returns;

  const exportExcel = () => {
    const headers = ["İade ID","Sipariş","Müşteri","Ürünler","Tutar","Sebep","Durum","Kargo","Takip No","Tarih"];
    const rows = filtered.map(r => [
      `#${r.id.slice(0,8)}`, `#${r.order.id.slice(0,8)}`, esc(r.order.user.name),
      esc(r.order.items.map(i => i.product.name).join(", ")),
      `${tl(r.order.total)}₺`, esc(r.reason),
      statusLabels[r.status] || r.status,
      r.cargoCompany || "—", r.trackingNumber || "—", trDate(r.createdAt),
    ]);
    downloadXls(`iade-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("İade Talepleri", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-amber-900">İade Yönetimi ({returns.length})</h1>
        <div className="flex items-center gap-3">
          {notifMsg && <span className="text-xs text-green-600 animate-pulse">{notifMsg}</span>}
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "pending", "approved", "picked_up", "refunded", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${filter === s ? "bg-amber-600 text-white border-amber-600" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
          >
            {s ? `${statusLabels[s]} (${returns.filter(r => r.status === s).length})` : `Tümü (${returns.length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">İade</th>
            <th className="text-left p-4">Sipariş</th>
            <th className="text-left p-4">Müşteri</th>
            <th className="text-left p-4">Sebep</th>
            <th className="text-left p-4">Tutar</th>
            <th className="text-left p-4">Durum</th>
            <th className="text-left p-4">Kargo</th>
          </tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4 font-mono text-xs text-gray-500">#{r.id.slice(0, 8)}</td>
                <td className="p-4 font-mono text-xs text-gray-500">#{r.order.id.slice(0, 8)}</td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">{r.order.user.name || "İsimsiz"}</p>
                  <p className="text-xs text-gray-500">{r.order.user.email}</p>
                </td>
                <td className="p-4 text-gray-600 max-w-[200px]">{r.reason}</td>
                <td className="p-4 font-semibold text-gray-900">{tl(r.order.total)}₺</td>
                <td className="p-4">
                  <select value={r.status} onChange={(e) => updateReturn(r.id, { status: e.target.value })}
                    className={`text-xs font-semibold px-2 py-1 rounded border-0 ${statusColors[r.status] || "bg-gray-100"}`}
                  >
                    {Object.entries(statusLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <select value={r.cargoCompany || ""} onChange={(e) => updateReturn(r.id, { cargoCompany: e.target.value })}
                      className="text-xs border border-amber-200 rounded px-1 py-0.5"
                    >
                      <option value="">Seçiniz</option>
                      {cargoCompanies.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <input type="text" defaultValue={r.trackingNumber || ""} placeholder="Takip no"
                      onBlur={(e) => updateReturn(r.id, { trackingNumber: e.target.value })}
                      className="text-xs border border-amber-200 rounded px-1 py-0.5"
                    />
                    <input type="text" defaultValue={r.notes || ""} placeholder="Not"
                      onBlur={(e) => updateReturn(r.id, { notes: e.target.value })}
                      className="text-xs border border-amber-200 rounded px-1 py-0.5"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">İade talebi yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
