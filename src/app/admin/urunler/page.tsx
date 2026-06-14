"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminProductFormModal from "@/components/AdminProductFormModal";

interface Product {
  id: string; name: string; slug: string; price: number; compareAt: number | null;
  stock: number; published: boolean; featured: boolean; origin: string | null;
  roastLevel: string | null; weight: number | null; description: string;
  process: string | null; region: string | null; altitude: string | null;
  variety: string | null; grade: string | null; body: string | null;
  acidity: string | null; segment: string | null; flavorNotes: string | null;
  roastedAt: string | null; isBestSeller: boolean; isNewArrival: boolean;
  status: string; estimatedRoastAt: string | null; seasonNote: string | null;
  greenBeanKg: number | null;
  category: { id: string; name: string };
}

export default function AdminUrunlerPage() {
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
    const note = prompt(stock > 0 ? "Stok kapatma sebebi:" : "Stok açma sebebi:");
    await fetch("/api/admin/products", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock: newStock, stockNote: note }),
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
        <div className="flex gap-2">
          <label className="bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm hover:bg-amber-50 cursor-pointer transition">
            CSV İçe
            <input type="file" accept=".csv" className="hidden" onChange={async e => {
              const file = e.target.files?.[0]; if (!file) return;
              const form = new FormData(); form.append("file", file);
              const res = await fetch("/api/admin/products-import", { method: "POST", body: form });
              const data = await res.json();
              alert(data.success ? `${data.imported} ürün içe aktarıldı` : `Hata: ${data.error}`);
              load();
            }} />
          </label>
          <a href="/api/admin/products-export"
            className="bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm hover:bg-amber-50 transition"
          >CSV</a>
          <button onClick={() => setEditing({ name: "", slug: "", price: 0, stock: 0, published: false })}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500 transition"
          >+ Yeni Ürün</button>
        </div>
      </div>

      <input type="text" placeholder="Ürün ara..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-amber-200 p-3 rounded-lg mb-6 text-sm focus:outline-none focus:border-amber-500" />

      {editing && (
        <AdminProductFormModal
          product={editing} categories={categories}
          onClose={() => setEditing(null)}
          onSave={() => { load(); setEditing(null); }}
          onDelete={() => { load(); setEditing(null); }}
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
