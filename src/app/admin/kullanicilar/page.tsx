"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { orders: number; subscriptions: number; chatThreads: number };
}

const roleLabels: Record<string, string> = { admin: "Admin", editor: "Editör", customer: "Müşteri" };
const roleColors: Record<string, string> = { admin: "bg-amber-100 text-amber-700", editor: "bg-blue-100 text-blue-700", customer: "bg-gray-100 text-gray-600" };
const roleOptions = ["customer", "editor", "admin"];

export default function AdminKullanicilarPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => { if (d.users) setUsers(d.users); });
  }, []);

  const changeRole = async (id: string, role: string) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    setUpdating(null);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setUsers(prev => [{ ...data.user, _count: { orders: 0, subscriptions: 0, chatThreads: 0 } }, ...prev]);
    setShowCreate(false);
    setForm({ name: "", email: "", password: "", role: "customer" });
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-heading">Kullanıcılar ({users.length})</h1>
        <button onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-hover transition">
          {showCreate ? "İptal" : "+ Yeni Kullanıcı"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createUser} className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Ad Soyad" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="border border-border p-3 rounded-lg text-sm focus:outline-none focus:border-primary" />
            <input type="email" placeholder="E-posta *" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="border border-border p-3 rounded-lg text-sm focus:outline-none focus:border-primary" />
            <input type="password" placeholder="Şifre *" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="border border-border p-3 rounded-lg text-sm focus:outline-none focus:border-primary" />
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="border border-border p-3 rounded-lg text-sm focus:outline-none focus:border-primary">
              <option value="customer">Müşteri</option>
              <option value="editor">Editör</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="bg-primary text-white text-sm px-6 py-2.5 rounded-lg hover:bg-primary-hover transition">
            Kullanıcı Oluştur
          </button>
        </form>
      )}

      <input type="text" placeholder="Kullanıcı ara..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-border p-3 rounded-lg mb-6 text-sm focus:outline-none focus:border-primary" />

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-page-hover border-b border-border text-heading">
              <th className="text-left p-4">Ad</th>
              <th className="text-left p-4">E-posta</th>
              <th className="text-left p-4">Rol</th>
              <th className="text-center p-4">Sipariş</th>
              <th className="text-center p-4">Abonelik</th>
              <th className="text-center p-4">Sohbet</th>
              <th className="text-left p-4">Kayıt</th>
              <th className="text-center p-4">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-page-hover">
                <td className="p-4 font-medium text-heading">{u.name || "—"}</td>
                <td className="p-4 text-body">{u.email}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${roleColors[u.role] || "bg-gray-100 text-gray-600"}`}>
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="p-4 text-center text-body">{u._count.orders}</td>
                <td className="p-4 text-center text-body">{u._count.subscriptions}</td>
                <td className="p-4 text-center text-body">{u._count.chatThreads}</td>
                <td className="p-4 text-muted">{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                <td className="p-4 text-center">
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                    disabled={updating === u.id}
                    className="text-xs border border-border rounded px-2 py-1.5 bg-white focus:outline-none focus:border-primary disabled:opacity-50">
                    {roleOptions.map(r => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
