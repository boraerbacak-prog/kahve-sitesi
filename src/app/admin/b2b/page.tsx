"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface B2BItem { id: string; type: string; title: string; description: string; icon: string; step: string; sortOrder: number; isActive: boolean; }

const TYPES: Record<string, string> = { service: "Hizmet", value: "Değer", process: "Süreç" };

export default function AdminB2B() {
  const [items, setItems] = useState<B2BItem[]>([]);
  const [editing, setEditing] = useState<Partial<B2BItem> | null>(null);

  const load = () => fetch("/api/admin/b2b").then(r => r.json()).then(d => { if (d.items) setItems(d.items); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = await fetch("/api/admin/b2b", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) { load(); setEditing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/b2b", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, B2BItem[]>);

  const exportExcel = () => {
    const headers = ["Tür", "Başlık", "Açıklama", "Sıra", "Aktif"];
    const rows = items.map(item => [
      esc(TYPES[item.type] || item.type), esc(item.title), esc(item.description),
      String(item.sortOrder), item.isActive ? "Evet" : "Hayır",
    ]);
    downloadXls(`b2b-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Kurumsal Sayfa", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Kurumsal Sayfa</h1>
        <button onClick={() => setEditing({ type: "service", title: "", description: "", icon: "", sortOrder: 0, isActive: true })}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500">+ Yeni</button>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-amber-900 mb-4">{editing.id ? "Düzenle" : "Yeni İçerik"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
                <select value={editing.type || "service"} onChange={e => setEditing({...editing, type: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm">
                  {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input type="text" value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea rows={3} value={editing.description || ""} onChange={e => setEditing({...editing, description: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İkon (emoji)</label>
                  <input type="text" value={editing.icon || ""} onChange={e => setEditing({...editing, icon: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adım</label>
                  <input type="text" value={editing.step || ""} onChange={e => setEditing({...editing, step: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" placeholder="01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                  <input type="number" value={editing.sortOrder ?? 0} onChange={e => setEditing({...editing, sortOrder: parseInt(e.target.value)})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isActive ?? true} onChange={e => setEditing({...editing, isActive: e.target.checked})} />
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

      <div className="space-y-8">
        {Object.entries(grouped).map(([type, typeItems]) => (
          <div key={type} className="bg-white rounded-xl border border-amber-100 p-6">
            <h2 className="text-lg font-bold text-amber-800 mb-4 capitalize">{TYPES[type] || type}</h2>
            <div className="space-y-2">
              {typeItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${item.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    {item.step && <span className="text-xs font-bold text-amber-700">{item.step}</span>}
                    <span className="font-medium text-gray-900">{item.title}</span>
                    <span className="text-xs text-gray-500 max-w-xs truncate">{item.description}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(item)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                    <button onClick={() => remove(item.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                  </div>
                </div>
              ))}
              {typeItems.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Henüz öğe yok</p>}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && <p className="text-sm text-gray-400">Henüz içerik yok</p>}
      </div>
    </div>
  );
}
