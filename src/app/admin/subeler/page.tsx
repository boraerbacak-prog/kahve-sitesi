"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls } from "@/lib/excel";

interface Store {
  id: string; name: string; slug: string;
  address: string | null; city: string | null;
  phone: string | null; email: string | null;
  latitude: number | null; longitude: number | null;
  image: string | null;
  isActive: boolean; sortOrder: number;
}

export default function AdminSubelerPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [editing, setEditing] = useState<Store | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/stores").then(r => r.json()).then(d => { if (d.stores) setStores(d.stores); });
  }, []);

  const emptyForm = { name: "", slug: "", address: "", city: "", phone: "", email: "", latitude: 0, longitude: 0, image: "", isActive: true, sortOrder: 0 };

  const save = async (form: any) => {
    const body = editing ? { id: editing.id, ...form } : form;
    const url = "/api/admin/stores";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setShowModal(false);
      setEditing(null);
      const d = await fetch("/api/admin/stores").then(r => r.json());
      if (d.stores) setStores(d.stores);
      setNotifMsg(editing ? "Şube güncellendi ✓" : "Şube eklendi ✓");
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/stores", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setStores(prev => prev.filter(s => s.id !== id));
    setNotifMsg("Şube silindi ✓");
    setTimeout(() => setNotifMsg(""), 3000);
  };

  const exportExcel = () => {
    const headers = ["Ad","Şehir","Adres","Telefon","E-posta","Aktif","Sıra"];
    const rows = stores.map(s => [
      esc(s.name), esc(s.city || "—"), esc(s.address || "—"),
      esc(s.phone || "—"), esc(s.email || "—"),
      s.isActive ? "Evet" : "Hayır", String(s.sortOrder),
    ]);
    downloadXls(`subeler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Şubeler", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Şubeler ({stores.length})</h1>
        <div className="flex items-center gap-3">
          {notifMsg && <span className="text-xs text-green-600 animate-pulse">{notifMsg}</span>}
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition">+ Yeni Şube</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-amber-900">{s.name}</h3>
                <p className="text-xs text-gray-500">{s.city || "—"}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {s.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
            {s.address && <p className="text-sm text-gray-600 mb-1">{s.address}</p>}
            {s.phone && <p className="text-xs text-gray-500">📞 {s.phone}</p>}
            {s.email && <p className="text-xs text-gray-500">📧 {s.email}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setEditing(s); setShowModal(true); }}
                className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded hover:bg-amber-200 transition">Düzenle</button>
              <button onClick={() => remove(s.id)}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition">Sil</button>
            </div>
          </div>
        ))}
        {stores.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">Henüz şube eklenmemiş</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-4">{editing ? "Şube Düzenle" : "Yeni Şube"}</h2>
            <StoreForm store={editing} onSave={save} onCancel={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function StoreForm({ store, onSave, onCancel }: { store: Store | null; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: store?.name || "",
    slug: store?.slug || "",
    address: store?.address || "",
    city: store?.city || "",
    phone: store?.phone || "",
    email: store?.email || "",
    latitude: store?.latitude || null as number | null,
    longitude: store?.longitude || null as number | null,
    image: store?.image || "",
    isActive: store?.isActive ?? true,
    sortOrder: store?.sortOrder || 0,
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Ad" value={form.name} onChange={e => update("name", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm col-span-2" />
        <input placeholder="Slug" value={form.slug} onChange={e => update("slug", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm col-span-2" />
        <input placeholder="Şehir" value={form.city} onChange={e => update("city", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Telefon" value={form.phone} onChange={e => update("phone", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="E-posta" value={form.email} onChange={e => update("email", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm col-span-2" />
        <textarea placeholder="Adres" value={form.address} onChange={e => update("address", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm col-span-2" rows={2} />
        <input placeholder="Enlem" type="number" value={form.latitude ?? ""} onChange={e => update("latitude", e.target.value ? parseFloat(e.target.value) : null)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Boylam" type="number" value={form.longitude ?? ""} onChange={e => update("longitude", e.target.value ? parseFloat(e.target.value) : null)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Sıra" type="number" value={form.sortOrder} onChange={e => update("sortOrder", parseInt(e.target.value) || 0)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.isActive} onChange={e => update("isActive", e.target.checked)} />
          Aktif
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} className="text-sm px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50">İptal</button>
        <button onClick={() => onSave(form)} className="text-sm px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition">Kaydet</button>
      </div>
    </div>
  );
}
