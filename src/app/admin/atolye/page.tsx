"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";
import ImageUpload from "@/components/admin/ImageUpload";

interface Workshop { id: string; title: string; description: string; imageUrl: string; date: string; sortOrder: number; isActive: boolean; }

export default function AdminAtolye() {
  const [items, setItems] = useState<Workshop[]>([]);
  const [editing, setEditing] = useState<Partial<Workshop> | null>(null);

  const load = () => fetch("/api/admin/workshops").then(r => r.json()).then(d => { if (d.items) setItems(d.items); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = await fetch("/api/admin/workshops", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) { load(); setEditing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/workshops", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const exportExcel = () => {
    const headers = ["Başlık", "Açıklama", "Tarih", "Sıra", "Aktif"];
    const rows = items.map(item => [
      esc(item.title), esc(item.description), esc(item.date),
      String(item.sortOrder), item.isActive ? "Evet" : "Hayır",
    ]);
    downloadXls(`atolye-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Atölyeler", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Atölyeler</h1>
        <button onClick={() => setEditing({ title: "", description: "", imageUrl: "", date: "", sortOrder: 0, isActive: true })}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500">+ Yeni Atölye</button>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-amber-900 mb-4">{editing.id ? "Düzenle" : "Yeni Atölye"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                  <input type="text" value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                  <input type="text" value={editing.date || ""} onChange={e => setEditing({...editing, date: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" placeholder="Nisan 2026" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea rows={3} value={editing.description || ""} onChange={e => setEditing({...editing, description: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Görsel</label>
                  <ImageUpload currentUrl={editing.imageUrl || ""} onUpload={url => setEditing({...editing, imageUrl: url})} />
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

      <div className="bg-white rounded-xl border border-amber-100 p-6">
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${item.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                {item.imageUrl && <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />}
                <div>
                  <span className="font-medium text-gray-900">{item.title}</span>
                  {item.date && <span className="text-xs text-gray-500 ml-2">{item.date}</span>}
                  <p className="text-xs text-gray-500 truncate max-w-md">{item.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(item)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                <button onClick={() => remove(item.id)} className="text-xs text-red-500 hover:underline">Sil</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Henüz atölye yok</p>}
        </div>
      </div>
    </div>
  );
}
