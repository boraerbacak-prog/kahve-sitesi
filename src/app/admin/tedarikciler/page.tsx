"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls } from "@/lib/excel";

interface Supplier {
  id: string; name: string;
  contactName: string | null; email: string | null;
  phone: string | null; address: string | null;
  notes: string | null; isActive: boolean;
  _count?: { purchaseOrders: number };
}

export default function AdminTedarikcilerPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/suppliers").then(r => r.json()).then(d => { if (d.suppliers) setSuppliers(d.suppliers); });
  }, []);

  const save = async (form: any) => {
    const body = editing ? { id: editing.id, ...form } : form;
    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/admin/suppliers", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setShowModal(false);
      setEditing(null);
      const d = await fetch("/api/admin/suppliers").then(r => r.json());
      if (d.suppliers) setSuppliers(d.suppliers);
      setNotifMsg(editing ? "Tedarikçi güncellendi ✓" : "Tedarikçi eklendi ✓");
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/suppliers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setNotifMsg("Tedarikçi silindi ✓");
    setTimeout(() => setNotifMsg(""), 3000);
  };

  const exportExcel = () => {
    const headers = ["Ad","İletişim","E-posta","Telefon","Adres","Aktif","Sipariş Sayısı"];
    const rows = suppliers.map(s => [
      esc(s.name), esc(s.contactName || "—"), esc(s.email || "—"),
      esc(s.phone || "—"), esc(s.address || "—"),
      s.isActive ? "Evet" : "Hayır", String(s._count?.purchaseOrders || 0),
    ]);
    downloadXls(`tedarikciler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Tedarikçiler", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Tedarikçiler ({suppliers.length})</h1>
        <div className="flex items-center gap-3">
          {notifMsg && <span className="text-xs text-green-600 animate-pulse">{notifMsg}</span>}
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
          <Link href="/admin/tedarik-siparisleri" className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition">Siparişler →</Link>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition">+ Yeni Tedarikçi</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Ad</th>
            <th className="text-left p-4">İletişim</th>
            <th className="text-left p-4">Telefon</th>
            <th className="text-left p-4">E-posta</th>
            <th className="text-left p-4">Sipariş</th>
            <th className="text-left p-4">Durum</th>
            <th className="text-left p-4"></th>
          </tr></thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4 font-medium text-gray-900">{s.name}</td>
                <td className="p-4 text-gray-600">{s.contactName || "—"}</td>
                <td className="p-4 text-gray-600">{s.phone || "—"}</td>
                <td className="p-4 text-gray-600">{s.email || "—"}</td>
                <td className="p-4 text-gray-600">{s._count?.purchaseOrders || 0}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(s); setShowModal(true); }}
                      className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200">Düzenle</button>
                    <button onClick={() => remove(s.id)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Tedarikçi yok</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-4">{editing ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}</h2>
            <SupplierForm supplier={editing} onSave={save} onCancel={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function SupplierForm({ supplier, onSave, onCancel }: { supplier: Supplier | null; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: supplier?.name || "",
    contactName: supplier?.contactName || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    address: supplier?.address || "",
    notes: supplier?.notes || "",
    isActive: supplier?.isActive ?? true,
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-3">
      <input placeholder="Firma Adı" value={form.name} onChange={e => update("name", e.target.value)}
        className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
      <input placeholder="İletişim Kişisi" value={form.contactName} onChange={e => update("contactName", e.target.value)}
        className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Telefon" value={form.phone} onChange={e => update("phone", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="E-posta" value={form.email} onChange={e => update("email", e.target.value)}
          className="border border-amber-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <textarea placeholder="Adres" value={form.address} onChange={e => update("address", e.target.value)}
        className="border border-amber-200 rounded-lg px-3 py-2 text-sm" rows={2} />
      <textarea placeholder="Notlar" value={form.notes} onChange={e => update("notes", e.target.value)}
        className="border border-amber-200 rounded-lg px-3 py-2 text-sm" rows={2} />
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={form.isActive} onChange={e => update("isActive", e.target.checked)} />
        Aktif
      </label>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} className="text-sm px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50">İptal</button>
        <button onClick={() => onSave(form)} className="text-sm px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition">Kaydet</button>
      </div>
    </div>
  );
}
