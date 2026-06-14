"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface Log {
  id: string; oldStock: number; newStock: number; change: number; note: string | null; createdAt: string;
  product: { name: string; slug: string };
}

export default function StokGecmisiPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    fetch("/api/admin/stok-log").then(r => r.json()).then(d => { if (d.logs) setLogs(d.logs); });
  }, []);

  const exportExcel = () => {
    const headers = ["Tarih", "Ürün", "Eski Stok", "Yeni Stok", "Değişim", "Not"];
    const rows = logs.map(l => [
      trDate(l.createdAt), esc(l.product.name),
      String(l.oldStock), String(l.newStock),
      (l.change > 0 ? "+" : "") + String(l.change),
      esc(l.note || ""),
    ]);
    downloadXls(`stok-gecmisi-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Stok Geçmişi", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Stok Geçmişi ({logs.length})</h1>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Tarih</th><th className="text-left p-4">Ürün</th>
            <th className="text-left p-4">Eski</th><th className="text-left p-4">Yeni</th>
            <th className="text-left p-4">Değişim</th><th className="text-left p-4">Not</th>
          </tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-b border-amber-50">
                <td className="p-4 text-gray-500 text-xs">{new Date(l.createdAt).toLocaleString("tr-TR")}</td>
                <td className="p-4 font-medium text-gray-900">{l.product.name}</td>
                <td className="p-4">{l.oldStock}</td>
                <td className="p-4">{l.newStock}</td>
                <td className="p-4"><span className={`font-semibold ${l.change > 0 ? "text-green-600" : "text-red-600"}`}>{l.change > 0 ? "+" : ""}{l.change}</span></td>
                <td className="p-4 text-gray-500">{l.note || "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Henüz kayıt yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
