"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface Page {
  id: string; title: string; slug: string; content: string; published: boolean; template: string;
  createdAt: string; updatedAt: string;
}

export default function AdminSayfalarPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Partial<Page> | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages").then(r => r.json()).then(d => { if (d.pages) setPages(d.pages); });
  }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = await fetch("/api/admin/pages", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const data = await res.json();
      if (isNew) setPages(prev => [data.page, ...prev]);
      else setPages(prev => prev.map(p => p.id === data.page.id ? data.page : p));
      setEditing(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Sayfayı silmek istediğinize emin misiniz?")) return;
    const res = await fetch("/api/admin/pages", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setPages(prev => prev.filter(p => p.id !== id));
  };

  const exportExcel = () => {
    const headers = ["Başlık", "Slug", "Şablon", "Yayın Durumu", "Güncelleme"];
    const rows = pages.map(p => [
      esc(p.title), esc(p.slug), esc(p.template),
      p.published ? "Yayında" : "Taslak", trDate(p.updatedAt),
    ]);
    downloadXls(`sayfalar-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Sayfalar", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Sayfalar</h1>
        <button onClick={() => setEditing({ title: "", slug: "", content: "", template: "default", published: false })}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500 transition"
        >+ Yeni Sayfa</button>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-amber-900 mb-4">{editing.id ? "Sayfayı Düzenle" : "Yeni Sayfa"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                  <input type="text" value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input type="text" value={editing.slug || ""} onChange={e => setEditing({...editing, slug: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İçerik (HTML)</label>
                <textarea value={editing.content || ""} onChange={e => setEditing({...editing, content: e.target.value})} rows={15}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.published || false} onChange={e => setEditing({...editing, published: e.target.checked})} className="rounded" />
                  Yayında
                </label>
                <div>
                  <label className="text-sm font-medium text-gray-700 mr-2">Şablon</label>
                  <select value={editing.template || "default"} onChange={e => setEditing({...editing, template: e.target.value})}
                    className="border border-amber-200 p-2 rounded-lg text-sm">
                    <option value="default">Varsayılan</option>
                    <option value="full">Tam Genişlik</option>
                    <option value="landing">Açılış Sayfası</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm text-amber-700 hover:bg-amber-50">İptal</button>
              <button onClick={save} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500">{editing.id ? "Kaydet" : "Oluştur"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Başlık</th>
            <th className="text-left p-4">URL</th>
            <th className="text-left p-4">Şablon</th>
            <th className="text-left p-4">Durum</th>
            <th className="text-left p-4">Güncelleme</th>
            <th className="text-left p-4">İşlem</th>
          </tr></thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4 font-medium text-gray-900">{p.title}</td>
                <td className="p-4 text-gray-500">/{p.slug}</td>
                <td className="p-4 text-gray-600">{p.template}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.published ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{new Date(p.updatedAt).toLocaleDateString("tr-TR")}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                    <button onClick={() => remove(p.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Henüz sayfa yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
