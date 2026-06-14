"use client";

import { useState } from "react";

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

export default function AdminProductFormModal({ product, categories, onClose, onSave, onDelete }: {
  product: Partial<Product>;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState({ ...product, categoryId: product.category?.id || "" });
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const save = async () => {
    setSaving(true);
    const isNew = !form.id;
    const body: Record<string, unknown> = { ...form };
    if (body.roastedAt && typeof body.roastedAt === "string") body.roastedAt = new Date(body.roastedAt).toISOString();
    if (body.estimatedRoastAt && typeof body.estimatedRoastAt === "string") body.estimatedRoastAt = new Date(body.estimatedRoastAt).toISOString();
    try {
      const res = await fetch("/api/admin/products", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Hata"); return; }
      onSave();
    } catch { alert("Kayıt hatası"); }
    setSaving(false);
  };

  const remove = async () => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const res = await fetch("/api/admin/products", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });
    if (res.ok && onDelete) onDelete();
  };

  const set = (field: string, value: unknown) => setForm({ ...form, [field]: value } as any);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2c1810]">{form.id ? "Ürünü Düzenle" : "Yeni Ürün"}</h2>
          {form.id && onDelete && (
            <button onClick={remove} className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-3 py-1.5 rounded">Ürünü Sil</button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2"><h3 className="text-xs font-semibold text-[#C4724B] uppercase tracking-wider mb-2">Temel Bilgiler</h3></div>
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Ürün Adı</label>
            <input type="text" value={form.name || ""} onChange={e => set("name", e.target.value)}
              className="w-full border border-border p-2.5 rounded focus:outline-none focus:border-[#C4724B]" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Slug</label>
            <input type="text" value={form.slug || ""} onChange={e => set("slug", e.target.value)}
              className="w-full border border-border p-2.5 rounded focus:outline-none focus:border-[#C4724B]" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Kategori</label>
            <select value={form.categoryId || ""} onChange={e => set("categoryId", e.target.value)}
              className="w-full border border-border p-2.5 rounded">
              <option value="">Seçin</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Açıklama</label>
            <textarea value={form.description || ""} onChange={e => set("description", e.target.value)}
              className="w-full border border-border p-2.5 rounded h-20 focus:outline-none focus:border-[#C4724B]" />
          </div>

          <div className="col-span-2 mt-2"><h3 className="text-xs font-semibold text-[#C4724B] uppercase tracking-wider mb-2">Fiyat & Stok</h3></div>
          <div>
            <label className="block text-gray-700 mb-1">Fiyat (₺)</label>
            <input type="number" value={form.price || 0} onChange={e => set("price", parseFloat(e.target.value))}
              className="w-full border border-border p-2.5 rounded focus:outline-none focus:border-[#C4724B]" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">İndirimli Fiyat</label>
            <input type="number" value={form.compareAt ?? ""} onChange={e => set("compareAt", e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full border border-border p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Stok (adet)</label>
            <input type="number" value={form.stock ?? 0} onChange={e => set("stock", parseInt(e.target.value) || 0)}
              className="w-full border border-border p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Ağırlık (g)</label>
            <input type="number" value={form.weight ?? ""} onChange={e => set("weight", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-border p-2.5 rounded" />
          </div>

          <div className="col-span-2 mt-2"><h3 className="text-xs font-semibold text-[#C4724B] uppercase tracking-wider mb-2">Kavrum & Tazelik</h3></div>
          <div>
            <label className="block text-gray-700 mb-1">Kavrum Seviyesi</label>
            <select value={form.roastLevel || ""} onChange={e => set("roastLevel", e.target.value)}
              className="w-full border border-border p-2.5 rounded">
              <option value="">Seçin</option>
              <option value="light">Hafif</option>
              <option value="medium">Orta</option>
              <option value="dark">Koyu</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">İşleme Yöntemi</label>
            <select value={form.process || ""} onChange={e => set("process", e.target.value)}
              className="w-full border border-border p-2.5 rounded">
              <option value="">Seçin</option>
              <option value="Washed">Washed</option>
              <option value="Natural">Natural</option>
              <option value="Honey">Honey</option>
              <option value="Wet Hulled">Wet Hulled</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Son Kavrum Tarihi</label>
            <input type="date" value={form.roastedAt ? new Date(form.roastedAt).toISOString().split("T")[0] : ""}
              onChange={e => set("roastedAt", e.target.value || null)}
              className="w-full border border-border p-2.5 rounded" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Tahmini Kavrum</label>
            <input type="date" value={form.estimatedRoastAt ? new Date(form.estimatedRoastAt).toISOString().split("T")[0] : ""}
              onChange={e => set("estimatedRoastAt", e.target.value || null)}
              className="w-full border border-border p-2.5 rounded" />
          </div>

          <div className="col-span-2 mt-2"><h3 className="text-xs font-semibold text-[#C4724B] uppercase tracking-wider mb-2">Ürün Durumu</h3></div>
          <div>
            <label className="block text-gray-700 mb-1">Yayın Durumu</label>
            <select value={form.status || "active"} onChange={e => set("status", e.target.value)}
              className="w-full border border-border p-2.5 rounded">
              <option value="active">🟢 Aktif Satışta</option>
              <option value="coming_soon">🟡 Yakında Gelecek</option>
              <option value="archived">🔴 Sezonu Bitti / Arşiv</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Yeşil Çekirdek (kg)</label>
            <input type="number" value={form.greenBeanKg ?? ""} onChange={e => set("greenBeanKg", e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full border border-border p-2.5 rounded" placeholder="0 = tükenmek üzere" />
          </div>
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Sezon Notu (müşteriye gösterilir)</label>
            <textarea value={form.seasonNote || ""} onChange={e => set("seasonNote", e.target.value)}
              className="w-full border border-border p-2.5 rounded h-16"
              placeholder='Örn: "Yeni hasat gelene kadar stokta olmayacaktır"' />
          </div>

          <div className="col-span-2 mt-2"><h3 className="text-xs font-semibold text-[#C4724B] uppercase tracking-wider mb-2">Vitrin</h3></div>
          <div className="col-span-2 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.published || false} onChange={e => set("published", e.target.checked)} /> Yayında</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured || false} onChange={e => set("featured", e.target.checked)} /> Öne Çıkan</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isBestSeller || false} onChange={e => set("isBestSeller", e.target.checked)} /> En Çok Satan</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNewArrival || false} onChange={e => set("isNewArrival", e.target.checked)} /> Yeni Ürün</label>
          </div>

          <div className="col-span-2 mt-2">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-[#C4724B] hover:underline">
              {showAdvanced ? "− Detayları Gizle" : "+ Detaylı Ürün Bilgileri"}
            </button>
          </div>
          {showAdvanced && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Bölge</label>
                <input type="text" value={form.region || ""} onChange={e => set("region", e.target.value)}
                  className="w-full border border-border p-2.5 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Rakım</label>
                <input type="text" value={form.altitude || ""} onChange={e => set("altitude", e.target.value)}
                  className="w-full border border-border p-2.5 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Tür (Variety)</label>
                <input type="text" value={form.variety || ""} onChange={e => set("variety", e.target.value)}
                  className="w-full border border-border p-2.5 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Sınıf (Grade)</label>
                <input type="text" value={form.grade || ""} onChange={e => set("grade", e.target.value)}
                  className="w-full border border-border p-2.5 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Gövde</label>
                <select value={form.body || ""} onChange={e => set("body", e.target.value)}
                  className="w-full border border-border p-2.5 rounded">
                  <option value="">Seçin</option>
                  <option value="Light">Hafif</option>
                  <option value="Medium">Orta</option>
                  <option value="Full">Dolgun</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Asidite</label>
                <select value={form.acidity || ""} onChange={e => set("acidity", e.target.value)}
                  className="w-full border border-border p-2.5 rounded">
                  <option value="">Seçin</option>
                  <option value="Low">Düşük</option>
                  <option value="Medium">Orta</option>
                  <option value="High">Yüksek</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Segment</label>
                <select value={form.segment || ""} onChange={e => set("segment", e.target.value)}
                  className="w-full border border-border p-2.5 rounded">
                  <option value="">Seçin</option>
                  <option value="specialty">Özel Seçki</option>
                  <option value="standard">Standart</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Tat Profili (JSON array)</label>
                <input type="text" value={form.flavorNotes || "[]"} onChange={e => set("flavorNotes", e.target.value)}
                  className="w-full border border-border p-2.5 rounded font-mono text-xs" placeholder='["çikolata","fındık","karamel"]' />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6 justify-end border-t border-border pt-4">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm text-[#666] hover:bg-[#f8f6f3]">İptal</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-[#2c1810] text-white rounded-lg text-sm hover:bg-[#4a3426] disabled:opacity-50"
          >{saving ? "Kaydediliyor..." : form.id ? "Güncelle" : "Oluştur"}</button>
        </div>
      </div>
    </div>
  );
}
