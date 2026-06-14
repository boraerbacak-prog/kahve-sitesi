"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface ProcessStep { id: string; step: string; title: string; description: string; sortOrder: number; isActive: boolean; }

export default function AdminKavurumhane() {
  const [info, setInfo] = useState({ title: "Kavurumhane", description: "", address: "" });
  const [processes, setProcesses] = useState<ProcessStep[]>([]);
  const [editing, setEditing] = useState<Partial<ProcessStep> | null>(null);

  const load = () => {
    fetch("/api/admin/kavurumhane").then(r => r.json()).then(d => {
      if (d.info) setInfo(d.info);
      if (d.processes) setProcesses(d.processes);
    });
  };
  useEffect(() => { load(); }, []);

  const saveInfo = async () => {
    await fetch("/api/admin/kavurumhane", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _type: "info", ...info }),
    });
    alert("Kaydedildi");
  };

  const saveProcess = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = await fetch("/api/admin/kavurumhane", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _type: "process", ...editing }),
    });
    if (res.ok) { load(); setEditing(null); }
  };

  const removeProcess = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/kavurumhane", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const exportExcel = () => {
    const infoHeaders = ["Alan", "Değer"];
    const infoRows = [
      ["Başlık", esc(info.title)],
      ["Açıklama", esc(info.description)],
      ["Adres", esc(info.address)],
    ];
    const procHeaders = ["Adım", "Başlık", "Açıklama", "Sıra", "Aktif"];
    const procRows = processes.map(p => [
      esc(p.step), esc(p.title), esc(p.description),
      String(p.sortOrder), p.isActive ? "Evet" : "Hayır",
    ]);
    const infoHtml = htmlExcel("Genel Bilgiler", infoHeaders, infoRows);
    const procHtml = htmlExcel("Süreç Adımları", procHeaders, procRows);
    const combined = infoHtml.replace("</body></html>", "") + procHtml.replace(/^[\s\S]*?<body>/i, "");
    downloadXls(`kavurumhane-${new Date().toISOString().slice(0,10)}.xls`, combined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Kavurumhane</h1>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-amber-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-amber-800 mb-4">Genel Bilgiler</h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
            <input type="text" value={info.title} onChange={e => setInfo({...info, title: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea rows={3} value={info.description} onChange={e => setInfo({...info, description: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <input type="text" value={info.address} onChange={e => setInfo({...info, address: e.target.value})}
              className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
          </div>
          <button onClick={saveInfo} className="bg-amber-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-amber-500">Kaydet</button>
        </div>
      </div>

      {/* Süreç Adımları */}
      <div className="bg-white rounded-xl border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-800">Süreç Adımları</h2>
          <button onClick={() => setEditing({ step: "", title: "", description: "", sortOrder: 0, isActive: true })}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-500">+ Yeni Adım</button>
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-amber-900 mb-4">{editing.id ? "Düzenle" : "Yeni Adım"}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adım</label>
                    <input type="text" value={editing.step || ""} onChange={e => setEditing({...editing, step: e.target.value})}
                      className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" placeholder="01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})}
                      className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea rows={3} value={editing.description || ""} onChange={e => setEditing({...editing, description: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.isActive ?? true} onChange={e => setEditing({...editing, isActive: e.target.checked})} />
                  Aktif
                </label>
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <button onClick={() => setEditing(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm">İptal</button>
                <button onClick={saveProcess} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500">Kaydet</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {processes.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${p.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                <span className="text-xs font-bold text-amber-700">{p.step}</span>
                <span className="font-medium text-gray-900">{p.title}</span>
                <span className="text-xs text-gray-500 max-w-md truncate">{p.description}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="text-xs text-amber-600 hover:underline">Düzenle</button>
                <button onClick={() => removeProcess(p.id)} className="text-xs text-red-500 hover:underline">Sil</button>
              </div>
            </div>
          ))}
          {processes.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Henüz adım yok</p>}
        </div>
      </div>
    </div>
  );
}
