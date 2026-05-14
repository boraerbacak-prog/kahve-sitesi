"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Block {
  id: string; section: string; blockType: string;
  title: string; subtitle: string; content: string;
  imageUrl: string; imageSize: string;
  linkUrl: string; linkText: string;
  badgeText: string; sortOrder: number;
  isActive: boolean; styles: string;
}

const blockTypeLabels: Record<string, string> = {
  "hero-heading": "Hero Başlık",
  "hero-kahveni-bul": "Kahveni Bul",
  "hero-barista": "Barista ile Konuş",
};

export default function AdminHomepagePage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editing, setEditing] = useState<Block | null>(null);

  useEffect(() => {
    fetch("/api/admin/homepage").then(r => r.json()).then(d => { if (d.blocks) setBlocks(d.blocks); });
  }, []);

  const save = async () => {
    if (!editing) return;
    const res = await fetch("/api/admin/homepage", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const data = await res.json();
      setBlocks(prev => prev.map(b => b.id === data.block.id ? data.block : b));
      setEditing(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Ana Sayfa Düzenle</h1>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-amber-900 mb-4">
              {blockTypeLabels[editing.blockType] || editing.blockType}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık (HTML)</label>
                  <input type="text" value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                  <input type="text" value={editing.subtitle || ""} onChange={e => setEditing({...editing, subtitle: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İçerik / Açıklama</label>
                <textarea value={editing.content || ""} onChange={e => setEditing({...editing, content: e.target.value})} rows={3}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                  <input type="text" value={editing.imageUrl || ""} onChange={e => setEditing({...editing, imageUrl: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                  {editing.imageUrl && (
                    <img src={editing.imageUrl} alt="preview" className="mt-2 w-20 h-20 object-contain rounded border" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Görsel Boyutu (Tailwind)</label>
                  <input type="text" value={editing.imageSize || ""} onChange={e => setEditing({...editing, imageSize: e.target.value})}
                    placeholder="w-[350px] h-[350px] lg:w-[500px] lg:h-[500px]"
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                  <p className="text-xs text-gray-400 mt-1">Örn: w-[400px] h-[400px] lg:w-[600px] lg:h-[600px]</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input type="text" value={editing.linkUrl || ""} onChange={e => setEditing({...editing, linkUrl: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Metni</label>
                  <input type="text" value={editing.linkText || ""} onChange={e => setEditing({...editing, linkText: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rozet Metni</label>
                  <input type="text" value={editing.badgeText || ""} onChange={e => setEditing({...editing, badgeText: e.target.value})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                  <input type="number" value={editing.sortOrder} onChange={e => setEditing({...editing, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full border border-amber-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.isActive} onChange={e => setEditing({...editing, isActive: e.target.checked})} className="rounded" />
                    Aktif
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stil Ayarları (JSON)</label>
                <textarea value={editing.styles || "{}"} onChange={e => setEditing({...editing, styles: e.target.value})} rows={4}
                  className="w-full border border-amber-200 p-2.5 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm text-amber-700 hover:bg-amber-50">İptal</button>
              <button onClick={save} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="bg-white rounded-xl border border-amber-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${block.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {block.isActive ? "Aktif" : "Pasif"}
                </span>
                <span className="text-xs text-gray-400 ml-2">{block.section} / {blockTypeLabels[block.blockType] || block.blockType}</span>
                <h3 className="text-lg font-bold text-amber-900 mt-2" dangerouslySetInnerHTML={{ __html: block.title || "(başlık yok)" }} />
              </div>
              <button onClick={() => setEditing(block)} className="text-sm text-amber-600 hover:underline">Düzenle</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block">Görsel</span>
                {block.imageUrl ? (
                  <img src={block.imageUrl} alt="" className="w-16 h-16 object-contain mt-1 rounded border" />
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </div>
              <div>
                <span className="text-gray-400 block">Boyut</span>
                <span className="text-gray-600 text-xs">{block.imageSize || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Link</span>
                <span className="text-gray-600">{block.linkUrl || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Sıra</span>
                <span className="text-gray-600">{block.sortOrder}</span>
              </div>
            </div>

            {block.content && (
              <p className="text-sm text-gray-600 mt-3 border-t border-amber-50 pt-3">{block.content}</p>
            )}

            <div className="mt-3 border-t border-amber-50 pt-3">
              <span className="text-gray-400 text-xs block mb-1">Stil (JSON):</span>
              <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-x-auto">{block.styles}</pre>
            </div>
          </div>
        ))}
        {blocks.length === 0 && <p className="text-center text-gray-400 py-12">Henüz blok yok</p>}
      </div>
    </div>
  );
}
