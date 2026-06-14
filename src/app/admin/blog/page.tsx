"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface Post { id: string; title: string; slug: string; excerpt: string; content: string; imageUrl: string | null; author: string; published: boolean; createdAt: string; category: { id: string; name: string } | null; tags: { id: string; name: string }[]; }
interface Category { id: string; name: string; }
interface Tag { id: string; name: string; }

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = () => fetch("/api/admin/blog").then(r => r.json()).then(d => { if (d.posts) setPosts(d.posts); });
  const loadMeta = () => {
    fetch("/api/admin/blog-categories").then(r => r.json()).then(d => { if (d.categories) setCategories(d.categories); });
    fetch("/api/admin/blog-tags").then(r => r.json()).then(d => { if (d.tags) setTags(d.tags); });
  };
  useEffect(() => { load(); loadMeta(); }, []);

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    const res = await fetch("/api/admin/blog", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) { load(); setEditing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/blog", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const exportExcel = () => {
    const headers = ["Başlık", "Slug", "Kategori", "Yazar", "Yayın Durumu", "Tarih"];
    const rows = posts.map(p => [
      esc(p.title), esc(p.slug), esc(p.category?.name || ""),
      esc(p.author), p.published ? "Yayında" : "Taslak", trDate(p.createdAt),
    ]);
    downloadXls(`blog-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Blog", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-2 inline-block">← Admin Panel</Link>
      <Link href="/admin/kategoriler" className="text-sm text-amber-600 hover:underline mb-2 inline-block ml-4">Kategoriler & Etiketler →</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Blog ({posts.length})</h1>
        <button onClick={() => setEditing({ title: "", slug: "", excerpt: "", content: "", categoryId: "", tags: [] })}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">+ Yeni Yazı</button>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-amber-900 mb-4">{editing.id ? "Düzenle" : "Yeni Yazı"}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Başlık</label>
                <input type="text" value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Slug</label>
                <input type="text" value={editing.slug || ""} onChange={e => setEditing({...editing, slug: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Yazar</label>
                <input type="text" value={editing.author || "Rostello"} onChange={e => setEditing({...editing, author: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Kategori</label>
                <select value={editing.categoryId || ""} onChange={e => setEditing({...editing, categoryId: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded">
                  <option value="">Kategorisiz</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Etiketler</label>
                <select multiple value={editing.tags || []} onChange={e => setEditing({...editing, tags: Array.from(e.target.selectedOptions, o => o.value)})}
                  className="w-full border border-amber-200 p-2.5 rounded h-20">
                  {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Özet</label>
                <textarea value={editing.excerpt || ""} onChange={e => setEditing({...editing, excerpt: e.target.value})} rows={2}
                  className="w-full border border-amber-200 p-2.5 rounded" />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">İçerik (HTML)</label>
                <textarea value={editing.content || ""} onChange={e => setEditing({...editing, content: e.target.value})} rows={8}
                  className="w-full border border-amber-200 p-2.5 rounded font-mono text-xs" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Görsel URL</label>
                <input type="text" value={editing.imageUrl || ""} onChange={e => setEditing({...editing, imageUrl: e.target.value})}
                  className="w-full border border-amber-200 p-2.5 rounded" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.published || false} onChange={e => setEditing({...editing, published: e.target.checked})} /> Yayında</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm">İptal</button>
              <button onClick={save} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">{editing.id ? "Güncelle" : "Oluştur"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Başlık</th><th className="text-left p-4">Kategori</th><th className="text-left p-4">Etiketler</th><th className="text-left p-4">Yazar</th><th className="text-left p-4">Durum</th><th className="text-left p-4">İşlem</th>
          </tr></thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b border-amber-50">
                <td className="p-4 font-medium text-gray-900">{p.title}</td>
                <td className="p-4 text-gray-600 text-xs">{p.category?.name || "—"}</td>
                <td className="p-4">{p.tags?.map(t => <span key={t.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">{t.name}</span>)}</td>
                <td className="p-4 text-gray-600">{p.author}</td>
                <td className="p-4"><span className={`text-xs font-semibold px-2 py-1 rounded ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.published ? "Yayında" : "Taslak"}</span></td>
                <td className="p-4"><div className="flex gap-2"><button onClick={() => setEditing(p)} className="text-xs text-amber-600 hover:underline">Düzenle</button><button onClick={() => remove(p.id)} className="text-xs text-red-500 hover:underline">Sil</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
