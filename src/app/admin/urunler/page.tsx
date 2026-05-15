"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string; name: string; slug: string; price: number; compareAt: number | null;
  stock: number; published: boolean; featured: boolean; origin: string | null;
  roastLevel: string | null; weight: number | null;
  category: { id: string; name: string };
}

export default function AdminUrunlerPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const load = () => {
    fetch("/api/admin/products").then(r => r.json()).then(d => { if (d.products) setProducts(d.products); });
    fetch("/api/categories").then(r => r.json()).then(d => { if (d.categories) setCategories(d.categories); }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (id: string, published: boolean) => {
    await fetch("/api/admin/products", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published }),
    });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, published } : p));
  };

  const toggleStock = async (id: string, stock: number) => {
    const newStock = stock > 0 ? 0 : 999;
    await fetch("/api/admin/products", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock: newStock }),
    });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const remove = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.origin?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Ürünler ({products.length})</h1>
        <button onClick={() => setEditing({ name: "", slug: "", price: 0, stock: 0, published: false })}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500 transition"
        >+ Yeni Ürün</button>
      </div>

      <input type="text" placeholder="Ürün ara..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-amber-200 p-3 rounded-lg mb-6 text-sm focus:outline-none focus:border-amber-500" />

      {editing && (
        <ProductFormModal
          product={editing} categories={categories}
          onClose={() => setEditing(null)}
          onSave={() => { load(); setEditing(null); }}
        />
      )}

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Ürün</th>
            <th className="text-left p-4">Kategori</th>
            <th className="text-left p-4">Fiyat</th>
            <th className="text-left p-4">Stok</th>
            <th className="text-left p-4">Durum</th>
            <th className="text-left p-4">İşlem</th>
          </tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.origin || ""} {p.roastLevel ? `· ${p.roastLevel}` : ""}</p>
                </td>
                <td className="p-4 text-gray-600">{p.category.name}</td>
                <td className="p-4 font-semibold text-gray-900">{p.price.toLocaleString("tr-TR")}₺</td>
                <td className="p-4">
                  <button onClick={() => toggleStock(p.id, p.stock)}
                    className={`text-xs font-semibold px-2 py-1 rounded transition ${p.stock > 0 ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                  >{p.stock > 0 ? "Stokta" : "Tükendi"}</button>
                </td>
                <td className="p-4">
                  <button onClick={() => togglePublish(p.id, !p.published)}
                    className={`text-xs font-semibold px-2 py-1 rounded transition ${p.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >{p.published ? "Yayında" : "Taslak"}</button>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                    <button onClick={() => remove(p.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Ürün bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductFormModal({ product, categories, onClose, onSave }: {
  product: Partial<Product>; categories: { id: string; name: string }[];
  onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState({ ...product, categoryId: product.category?.id || "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const isNew = !form.id;
    await fetch("/api/admin/products", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-amber-900 mb-4">{form.id ? "Ürünü Düzenle" : "Yeni Ürün"}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Ürün Adı</label>
            <input type="text" value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Slug</label>
            <input type="text" value={form.slug || ""} onChange={e => setForm({...form, slug: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Kategori</label>
            <select value={form.categoryId || ""} onChange={e => setForm({...form, categoryId: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded">
              <option value="">Seçin</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Fiyat (₺)</label>
            <input type="number" value={form.price || 0} onChange={e => setForm({...form, price: parseFloat(e.target.value)})}
              className="w-full border border-amber-200 p-2.5 rounded focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">İndirimli Fiyat</label>
            <input type="number" value={form.compareAt || ""} onChange={e => setForm({...form, compareAt: e.target.value ? parseFloat(e.target.value) : null})}
              className="w-full border border-amber-200 p-2.5 rounded focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Stok</label>
            <input type="number" value={form.stock || 0} onChange={e => setForm({...form, stock: parseInt(e.target.value)})}
              className="w-full border border-amber-200 p-2.5 rounded focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Ağırlık (g)</label>
            <input type="number" value={form.weight || ""} onChange={e => setForm({...form, weight: e.target.value ? parseInt(e.target.value) : null})}
              className="w-full border border-amber-200 p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Menşei</label>
            <input type="text" value={form.origin || ""} onChange={e => setForm({...form, origin: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Kavrum</label>
            <select value={form.roastLevel || ""} onChange={e => setForm({...form, roastLevel: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded">
              <option value="">Seçin</option>
              <option value="light">Hafif</option>
              <option value="medium">Orta</option>
              <option value="dark">Koyu</option>
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.published || false} onChange={e => setForm({...form, published: e.target.checked})} /> Yayında</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured || false} onChange={e => setForm({...form, featured: e.target.checked})} /> Öne Çıkan</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-amber-200 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500 disabled:opacity-50"
          >{saving ? "Kaydediliyor..." : form.id ? "Güncelle" : "Oluştur"}</button>
        </div>
      </div>
    </div>
  );
}
