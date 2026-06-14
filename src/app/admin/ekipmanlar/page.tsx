"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Item {
  id: string; name: string; slug: string; description: string;
  price: number; salePrice: number | null; image: string;
  soldOut: boolean; published: boolean; createdAt: string;
}

export default function AdminEkipmanlarPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);

  const load = () => {
    fetch("/api/admin/equipment").then(r => r.json()).then(d => { if (d.equipment) setItems(d.equipment); });
  };

  useEffect(() => { load(); }, []);

  const toggleField = async (id: string, field: string, value: boolean) => {
    await fetch("/api/admin/equipment", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, [field]: value }),
    });
    setItems(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/equipment", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    setItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Ekipmanlar ({items.length})</h1>
        <div className="flex gap-2">
          <label className="bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm hover:bg-amber-50 cursor-pointer transition">
            CSV İçe
            <input type="file" accept=".csv" className="hidden" onChange={async e => {
              const file = e.target.files?.[0]; if (!file) return;
              const form = new FormData(); form.append("file", file);
              const res = await fetch("/api/admin/equip-import", { method: "POST", body: form });
              const data = await res.json();
              alert(data.success ? `${data.imported} ürün içe aktarıldı` : `Hata: ${data.error}`);
              load();
            }} />
          </label>
          <a href="/api/admin/equip-export"
            className="bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm hover:bg-amber-50 transition">CSV</a>
          <button onClick={() => setEditing({ name: "", slug: "", description: "", price: 0, image: "" })}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500 transition">+ Yeni Ekipman</button>
        </div>
      </div>

      {editing && (
        <ItemFormModal item={editing} onClose={() => setEditing(null)} onSave={() => { load(); setEditing(null); }} />
      )}

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
              <th className="text-left p-4">Sıra</th>
              <th className="text-left p-4">Ürün</th>
              <th className="text-left p-4">Fiyat</th>
              <th className="text-left p-4">Durum</th>
              <th className="text-left p-4">Yayın</th>
              <th className="text-left p-4">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={p.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4 text-gray-400 text-xs w-12">
                  <input type="number" value={(p as any).sortOrder ?? i} onChange={e => {
                    fetch("/api/admin/equipment", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, sortOrder: parseInt(e.target.value) || 0 }) });
                  }} className="w-14 border border-amber-200 p-1 rounded text-center text-xs" />
                </td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">/{p.slug}</p>
                </td>
                <td className="p-4 font-semibold text-gray-900">
                  {p.price.toLocaleString("tr-TR")}₺
                  {p.salePrice && <span className="text-xs text-gray-400 line-through ml-2">{p.salePrice.toLocaleString("tr-TR")}₺</span>}
                </td>
                <td className="p-4">
                  <button onClick={() => toggleField(p.id, "soldOut", !p.soldOut)}
                    className={`text-xs font-semibold px-2 py-1 rounded transition ${p.soldOut ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {p.soldOut ? "Tükendi" : "Stokta"}
                  </button>
                </td>
                <td className="p-4">
                  <button onClick={() => toggleField(p.id, "published", !p.published)}
                    className={`text-xs font-semibold px-2 py-1 rounded transition ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.published ? "Yayında" : "Taslak"}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                    <button onClick={() => remove(p.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Ekipman bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemFormModal({ item, onClose, onSave }: {
  item: Partial<Item>; onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = { ...form, price: parseFloat(String(form.price || 0)), salePrice: form.salePrice ? parseFloat(String(form.salePrice)) : null };
    const isNew = !form.id;
    await fetch("/api/admin/equipment", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(isNew ? payload : { id: form.id, ...payload }),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-amber-900 mb-4">{form.id ? "Ekipmanı Düzenle" : "Yeni Ekipman"}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Ürün Adı</label>
            <input type="text" value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Slug</label>
            <input type="text" value={form.slug || ""} onChange={e => setForm({...form, slug: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Sıralama</label>
            <input type="number" value={(form as any).sortOrder ?? 0} onChange={e => setForm({...(form as any), sortOrder: parseInt(e.target.value) || 0} as any)}
              className="w-full border border-amber-200 p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Fiyat (₺)</label>
            <input type="number" step="0.01" value={form.price || 0} onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})}
              className="w-full border border-amber-200 p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">İndirimli Fiyat</label>
            <input type="number" step="0.01" value={form.salePrice ?? ""} onChange={e => setForm({...form, salePrice: e.target.value ? parseFloat(e.target.value) : null})}
              className="w-full border border-amber-200 p-2.5 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Görsel (public/ekipman/ içindeki dosya adı)</label>
            <input type="text" value={form.image || ""} onChange={e => setForm({...form, image: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded" placeholder="ornek-resim.jpg" />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Açıklama</label>
            <textarea value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} rows={3}
              className="w-full border border-amber-200 p-2.5 rounded" />
          </div>
          <div className="col-span-2 flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.published || false} onChange={e => setForm({...form, published: e.target.checked})} /> Yayında
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.soldOut || false} onChange={e => setForm({...form, soldOut: e.target.checked})} /> Tükendi
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-amber-200 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500 disabled:opacity-50">
            {saving ? "Kaydediliyor..." : form.id ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
