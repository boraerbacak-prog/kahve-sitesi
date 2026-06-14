"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { tl, trDate, esc, htmlExcel, downloadXls } from "@/lib/excel";

interface Coupon { id: string; code: string; discountPct: number; discountLira: number; minAmount: number; maxUses: number; useCount: number; expiresAt: string | null; isActive: boolean; createdAt: string; }

export default function AdminKupon() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);

  const load = () => fetch("/api/admin/kupon").then(r => r.json()).then(d => { if (d.coupons) setItems(d.coupons); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = await fetch("/api/admin/kupon", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) { load(); setEditing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/kupon", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const exportExcel = () => {
    const headers = ["Kod","İndirim %","İndirim ₺","Min. Tutar","Kullanım","Max Kullanım","Bitiş","Durum","Oluşturma"];
    const rows = items.map(c => [
      c.code, c.discountPct ? `%${c.discountPct}` : "—", c.discountLira ? `${tl(c.discountLira)}₺` : "—",
      tl(c.minAmount), String(c.useCount), c.maxUses ? String(c.maxUses) : "Sınırsız",
      c.expiresAt ? trDate(c.expiresAt) : "—", c.isActive ? "Aktif" : "Pasif", trDate(c.createdAt),
    ]);
    downloadXls(`kuponlar-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Kuponlar", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Kuponlar</h1>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500">Excel</button>
          <button onClick={() => setEditing({ code: "", discountPct: 0, discountLira: 0, minAmount: 0, maxUses: 0, isActive: true })}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500">+ Yeni</button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-amber-900 mb-4">{editing.id ? "Düzenle" : "Yeni Kupon"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kod</label>
                  <input type="text" value={editing.code || ""} onChange={e => setEditing({...editing, code: e.target.value.toUpperCase()})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm font-mono uppercase" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">İndirim %</label>
                  <input type="number" value={editing.discountPct || 0} onChange={e => setEditing({...editing, discountPct: parseFloat(e.target.value)})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">İndirim ₺</label>
                  <input type="number" value={editing.discountLira || 0} onChange={e => setEditing({...editing, discountLira: parseFloat(e.target.value)})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Min. Tutar</label>
                  <input type="number" value={editing.minAmount || 0} onChange={e => setEditing({...editing, minAmount: parseFloat(e.target.value)})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Kullanım (0=sınırsız)</label>
                  <input type="number" value={editing.maxUses ?? 0} onChange={e => setEditing({...editing, maxUses: parseInt(e.target.value)})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                  <input type="date" value={editing.expiresAt ? editing.expiresAt.slice(0, 10) : ""} onChange={e => setEditing({...editing, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isActive ?? true} onChange={e => setEditing({...editing, isActive: e.target.checked})} className="accent-amber-600" />
                Aktif
              </label>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm">İptal</button>
              <button onClick={save} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Kod</th>
            <th className="text-left p-4">İndirim</th>
            <th className="text-right p-4">Min. Tutar</th>
            <th className="text-center p-4">Kullanım</th>
            <th className="text-left p-4">Bitiş</th>
            <th className="text-left p-4">Durum</th>
            <th className="text-left p-4">İşlem</th>
          </tr></thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4"><span className="font-mono font-bold text-amber-900">{c.code}</span></td>
                <td className="p-4">
                  {c.discountPct > 0 && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">%{c.discountPct}</span>}
                  {c.discountLira > 0 && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded ml-1">{c.discountLira}₺</span>}
                </td>
                <td className="p-4 text-right text-gray-600">{tl(c.minAmount)}₺</td>
                <td className="p-4 text-center text-gray-600">{c.useCount}/{c.maxUses || "∞"}</td>
                <td className="p-4 text-gray-500 text-xs">{c.expiresAt ? trDate(c.expiresAt) : "—"}</td>
                <td className="p-4"><span className={`text-xs font-semibold px-2 py-1 rounded ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.isActive ? "Aktif" : "Pasif"}</span></td>
                <td className="p-4"><div className="flex gap-2">
                  <button onClick={() => setEditing(c)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                  <button onClick={() => remove(c.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                </div></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Henüz kupon yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
