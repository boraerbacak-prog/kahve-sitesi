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

export default function AdminKullanicilarPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => { if (d.users) setUsers(d.users); });
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Kullanıcılar ({users.length})</h1>

      <input
        type="text"
        placeholder="Kullanıcı ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-amber-200 p-3 rounded-lg mb-6 text-sm focus:outline-none focus:border-amber-500"
      />

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Ad</th>
            <th className="text-left p-4">E-posta</th>
            <th className="text-left p-4">Rol</th>
            <th className="text-center p-4">Sipariş</th>
            <th className="text-center p-4">Abonelik</th>
            <th className="text-center p-4">Sohbet</th>
            <th className="text-left p-4">Kayıt</th>
          </tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-amber-50 hover:bg-amber-50/50 cursor-pointer" onClick={() => setSelected(selected?.id === u.id ? null : u)}>
                <td className="p-4 font-medium text-gray-900">{u.name || "—"}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-center text-gray-600">{u._count.orders}</td>
                <td className="p-4 text-center text-gray-600">{u._count.subscriptions}</td>
                <td className="p-4 text-center text-gray-600">{u._count.chatThreads}</td>
                <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
