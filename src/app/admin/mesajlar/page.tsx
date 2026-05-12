"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Thread {
  id: string;
  title: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  messages: { id: string; role: string; content: string; createdAt: string }[];
}

export default function AdminMesajlarPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(async (d) => {
        if (!d.users) return;
        const allThreads: Thread[] = [];
        for (const u of d.users.slice(0, 20)) {
          const res = await fetch(`/api/admin/users/${u.id}`);
          const data = await res.json();
          if (data.user?.chatThreads) allThreads.push(...data.user.chatThreads);
        }
        allThreads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setThreads(allThreads.slice(0, 50));
      });
  }, []);

  const filtered = search
    ? threads.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
      )
    : threads;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Müşteri Sohbetleri</h1>

      <input
        type="text" placeholder="Sohbetlerde ara..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-amber-200 p-3 rounded-lg mb-6 text-sm focus:outline-none focus:border-amber-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-amber-100 overflow-y-auto max-h-[70vh]">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => setSelected(t)}
              className={`w-full text-left p-4 border-b border-amber-50 hover:bg-amber-50/50 transition ${selected?.id === t.id ? "bg-amber-50" : ""}`}
            >
              <p className="text-sm font-semibold text-gray-900 truncate">{t.title || "Sohbet"}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.messages.length} mesaj · {new Date(t.createdAt).toLocaleDateString("tr-TR")}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">Sohbet bulunamadı</p>}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-amber-100 p-6 overflow-y-auto max-h-[70vh]">
          {selected ? (
            <div>
              <h2 className="text-lg font-bold text-amber-900 mb-4">{selected.title || "Sohbet"}</h2>
              <div className="space-y-4">
                {selected.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] p-4 rounded-lg text-sm ${
                      m.role === "user" ? "bg-amber-50 text-gray-800" : "bg-amber-600 text-white"
                    }`}>
                      <p className="text-[10px] opacity-60 mb-1 uppercase tracking-wide">
                        {m.role === "user" ? "Müşteri" : "AI Barista"}
                      </p>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p className="text-4xl mb-4">💬</p>
              <p>Görüntülemek için bir sohbet seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
