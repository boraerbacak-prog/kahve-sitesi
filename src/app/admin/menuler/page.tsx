"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MenuItem {
  id: string; label: string; href: string; parentId: string | null; sortOrder: number; isVisible: boolean; icon: string | null;
  children?: MenuItem[];
}

export default function AdminMenulerPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);

  const load = () => fetch("/api/admin/menus").then(r => r.json()).then(d => { if (d.items) setItems(d.items); });

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = await fetch("/api/admin/menus", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) { load(); setEditing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Bu menü öğesini silmek istediğinize emin misiniz?")) return;
    await fetch("/api/admin/menus", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Menü Yönetimi</h1>
        <button onClick={() => setEditing({ label: "", href: "", isVisible: true })}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500"
        >+ Yeni Menü Öğesi</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-amber-900 mb-4">{editing.id ? "Düzenle" : "Yeni Menü Öğesi"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiket</label>
                <input type="text" value={editing.label || ""} onChange={e => setEditing({...editing, label: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (href)</label>
                <input type="text" value={editing.href || ""} onChange={e => setEditing({...editing, href: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Üst Menü</label>
                  <select value={editing.parentId || ""} onChange={e => setEditing({...editing, parentId: e.target.value || null})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm">
                    <option value="">Ana Menü</option>
                    {items.filter(i => !i.parentId).map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                  <input type="number" value={editing.sortOrder || 0} onChange={e => setEditing({...editing, sortOrder: parseInt(e.target.value)})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isVisible ?? true} onChange={e => setEditing({...editing, isVisible: e.target.checked})} />
                Görünür
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
          {items.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${item.isVisible ? "bg-green-500" : "bg-gray-400"}`} />
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.href}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(item)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                  <button onClick={() => remove(item.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                </div>
              </div>
              {item.children && item.children.length > 0 && (
                <div className="ml-6 mt-2 space-y-2">
                  {item.children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${child.isVisible ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className="text-sm text-gray-700">{child.label}</span>
                        <span className="text-xs text-gray-500">{child.href}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(child)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                        <button onClick={() => remove(child.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Henüz menü öğesi yok</p>}
        </div>
      </div>
    </div>
  );
}
