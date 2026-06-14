"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface Category { id: string; name: string; slug: string; _count: { posts: number }; }
interface Tag { id: string; name: string; slug: string; _count: { posts: number }; }

export default function AdminBlogKategoriler() {
  const [tab, setTab] = useState<"kategori" | "etiket">("kategori");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const loadCats = () => fetch("/api/admin/blog-categories").then(r => r.json()).then(d => { if (d.categories) setCategories(d.categories); });
  const loadTags = () => fetch("/api/admin/blog-tags").then(r => r.json()).then(d => { if (d.tags) setTags(d.tags); });
  useEffect(() => { loadCats(); loadTags(); }, []);

  const add = async () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (tab === "kategori") {
      await fetch("/api/admin/blog-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim(), slug }) });
      loadCats();
    } else {
      await fetch("/api/admin/blog-tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim(), slug }) });
      loadTags();
    }
    setNewName("");
  };

  const update = async () => {
    if (!editing) return;
    await fetch("/api/admin/blog-categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, name: editing.name }) });
    setEditing(null); loadCats();
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    if (tab === "kategori") {
      await fetch("/api/admin/blog-categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      loadCats();
    } else {
      await fetch("/api/admin/blog-tags", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      loadTags();
    }
  };

  const exportExcel = () => {
    if (tab === "kategori") {
      const headers = ["Kategori Adı", "Slug", "Yazı Sayısı"];
      const rows = categories.map(c => [esc(c.name), esc(c.slug), String(c._count.posts)]);
      downloadXls(`kategoriler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Kategoriler", headers, rows));
    } else {
      const headers = ["Etiket Adı", "Slug", "Yazı Sayısı"];
      const rows = tags.map(t => [esc(t.name), esc(t.slug), String(t._count.posts)]);
      downloadXls(`etiketler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Etiketler", headers, rows));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <Link href="/admin/blog" className="text-sm text-amber-600 hover:underline mb-4 inline-block ml-4">← Blog Yazıları</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Blog Kategoriler & Etiketler</h1>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("kategori")} className={`text-sm px-4 py-2 rounded-lg ${tab === "kategori" ? "bg-amber-600 text-white" : "bg-white border border-amber-200"}`}>Kategoriler</button>
        <button onClick={() => setTab("etiket")} className={`text-sm px-4 py-2 rounded-lg ${tab === "etiket" ? "bg-amber-600 text-white" : "bg-white border border-amber-200"}`}>Etiketler</button>
      </div>

      <div className="flex gap-2 mb-6">
        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder={tab === "kategori" ? "Yeni kategori adı" : "Yeni etiket adı"}
          className="flex-1 border border-amber-200 p-2.5 rounded-lg text-sm" onKeyDown={e => e.key === "Enter" && add()} />
        <button onClick={add} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">Ekle</button>
      </div>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Ad</th><th className="text-left p-4">Slug</th><th className="text-center p-4">Yazı</th><th className="text-center p-4">İşlem</th>
          </tr></thead>
          <tbody>
            {(tab === "kategori" ? categories : tags).map(item => (
              <tr key={item.id} className="border-b border-amber-50">
                <td className="p-4 font-medium text-gray-900">
                  {editing?.id === item.id ? (
                    <input type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                      className="border border-amber-200 p-1.5 rounded text-sm" onKeyDown={e => e.key === "Enter" && update()} />
                  ) : item.name}
                </td>
                <td className="p-4 text-gray-500">{(item as any).slug}</td>
                <td className="p-4 text-center text-gray-600">{(item as any)._count?.posts || 0}</td>
                <td className="p-4 text-center">
                  {tab === "kategori" && (
                    editing?.id === item.id
                      ? <button onClick={update} className="text-xs text-green-600 hover:underline mr-2">Kaydet</button>
                      : <button onClick={() => setEditing({ id: item.id, name: item.name })} className="text-xs text-amber-600 hover:underline mr-2">Düzenle</button>
                  )}
                  <button onClick={() => remove(item.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
