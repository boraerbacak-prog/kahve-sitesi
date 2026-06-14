"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface Review {
  id: string; rating: number; comment: string | null; approved: boolean; createdAt: string;
  user: { name: string | null; email: string };
  product: { name: string; slug: string };
}

export default function YorumlarPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  const load = () => {
    fetch("/api/admin/reviews").then(r => r.json()).then(d => { if (d.reviews) setReviews(d.reviews); });
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, approved: boolean) => {
    await fetch("/api/admin/reviews", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved }) });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved } : r));
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r => filter === "all" ? true : filter === "approved" ? r.approved : !r.approved);

  const exportExcel = () => {
    const headers = ["Kullanıcı", "E-posta", "Ürün", "Puan", "Yorum", "Onay", "Tarih"];
    const rows = filtered.map(r => [
      esc(r.user.name || ""), esc(r.user.email), esc(r.product.name),
      String(r.rating), esc(r.comment || ""),
      r.approved ? "Onaylı" : "Beklemede", trDate(r.createdAt),
    ]);
    downloadXls(`yorumlar-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Ürün Yorumları", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Ürün Yorumları ({reviews.length})</h1>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      <div className="flex gap-4 mb-6">
        {(["pending", "approved", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-4 py-2 rounded-lg transition ${filter === f ? "bg-amber-600 text-white" : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"}`}>
            {f === "pending" ? "Onay Bekleyen" : f === "approved" ? "Onaylanan" : "Tümü"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{r.user.name || "İsimsiz"} <span className="text-xs text-gray-400">({r.user.email})</span></p>
                <p className="text-xs text-amber-600">{r.product.name} · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(r.id, !r.approved)}
                  className={`text-xs px-3 py-1 rounded transition ${r.approved ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                  {r.approved ? "Onayı Kaldır" : "Onayla"}
                </button>
                <button onClick={() => remove(r.id)} className="text-xs text-red-500 hover:underline">Sil</button>
              </div>
            </div>
            {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
            <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString("tr-TR")}</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-12">Yorum bulunamadı</p>}
      </div>
    </div>
  );
}
