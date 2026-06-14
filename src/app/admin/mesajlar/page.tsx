"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface ContactMsg {
  id: string; name: string; email: string; phone: string | null;
  subject: string; message: string; isRead: boolean; createdAt: string;
}

interface Thread {
  id: string; title: string | null; createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  messages: { id: string; role: string; content: string; createdAt: string }[];
}

export default function AdminMesajlarPage() {
  const [tab, setTab] = useState<"iletisim" | "ai">("iletisim");
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<ContactMsg | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  useEffect(() => {
    fetch("/api/admin/mesajlar").then(r => r.json()).then(d => { if (d.messages) setMessages(d.messages); });
    fetch("/api/admin/users").then(r => r.json()).then(async (d) => {
      if (!d.users) return;
      const all: Thread[] = [];
      for (const u of d.users.slice(0, 20)) {
        const res = await fetch(`/api/admin/users/${u.id}`);
        const data = await res.json();
        if (data.user?.chatThreads) all.push(...data.user.chatThreads);
      }
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setThreads(all.slice(0, 50));
    });
  }, []);

  const toggleRead = async (id: string, isRead: boolean) => {
    await fetch("/api/admin/mesajlar", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isRead: !isRead }) });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: !isRead } : m));
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/admin/mesajlar", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  const exportExcel = () => {
    if (tab === "iletisim") {
      const headers = ["Ad", "E-posta", "Telefon", "Konu", "Durum", "Tarih"];
      const rows = messages.map(m => [
        esc(m.name), esc(m.email), esc(m.phone || ""),
        esc(m.subject), m.isRead ? "Okundu" : "Okunmadı", trDate(m.createdAt),
      ]);
      downloadXls(`mesajlar-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Mesajlar", headers, rows));
    } else {
      const headers = ["Kullanıcı", "Başlık", "Mesaj Sayısı", "Tarih"];
      const rows = threads.map(t => [
        esc(t.user?.name || t.user?.email || ""), esc(t.title || ""),
        String(t.messages.length), trDate(t.createdAt),
      ]);
      downloadXls(`ai-sohbetler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("AI Barista Sohbetleri", headers, rows));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-heading">Mesajlar</h1>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-border">
        <button onClick={() => { setTab("iletisim"); setSelectedMsg(null); }}
          className={`pb-2 text-sm font-medium border-b-2 transition ${tab === "iletisim" ? "text-primary border-primary" : "text-muted border-transparent hover:text-heading"}`}>
          İletişim Mesajları ({messages.filter(m => !m.isRead).length})
        </button>
        <button onClick={() => { setTab("ai"); setSelectedThread(null); }}
          className={`pb-2 text-sm font-medium border-b-2 transition ${tab === "ai" ? "text-primary border-primary" : "text-muted border-transparent hover:text-heading"}`}>
          AI Barista Sohbetleri ({threads.length})
        </button>
      </div>

      {tab === "iletisim" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-border overflow-y-auto max-h-[70vh]">
            {messages.map(m => (
              <button key={m.id} onClick={() => setSelectedMsg(m)}
                className={`w-full text-left p-4 border-b border-border/50 hover:bg-page-hover transition ${selectedMsg?.id === m.id ? "bg-page-hover" : ""}`}>
                <div className="flex items-center gap-2">
                  {!m.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  <p className="text-sm font-semibold text-heading truncate flex-1">{m.subject}</p>
                </div>
                <p className="text-xs text-muted mt-0.5">{m.name} · {new Date(m.createdAt).toLocaleDateString("tr-TR")}</p>
              </button>
            ))}
            {messages.length === 0 && <p className="p-4 text-sm text-muted text-center">Henüz mesaj yok</p>}
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6">
            {selectedMsg ? (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-heading">{selectedMsg.subject}</h2>
                    <p className="text-sm text-muted">{selectedMsg.name} · {selectedMsg.email}</p>
                    {selectedMsg.phone && <p className="text-sm text-muted">{selectedMsg.phone}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleRead(selectedMsg.id, selectedMsg.isRead)}
                      className="text-xs text-primary hover:underline">{selectedMsg.isRead ? "Okunmadı İşaretle" : "Okundu İşaretle"}</button>
                    <button onClick={() => remove(selectedMsg.id)} className="text-xs text-red-500 hover:underline">Sil</button>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-body whitespace-pre-wrap">{selectedMsg.message}</p>
                </div>
                <p className="text-xs text-muted mt-4">{new Date(selectedMsg.createdAt).toLocaleString("tr-TR")}</p>
              </div>
            ) : (
              <div className="text-center text-muted py-12">
                <p className="text-4xl mb-4">✉️</p>
                <p>Görüntülemek için bir mesaj seçin</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-border overflow-y-auto max-h-[70vh]">
            {threads.map(t => (
              <button key={t.id} onClick={() => setSelectedThread(t)}
                className={`w-full text-left p-4 border-b border-border/50 hover:bg-page-hover transition ${selectedThread?.id === t.id ? "bg-page-hover" : ""}`}>
                <p className="text-sm font-semibold text-heading truncate">{t.title || "Sohbet"}</p>
                <p className="text-xs text-muted mt-0.5">{t.messages.length} mesaj · {new Date(t.createdAt).toLocaleDateString("tr-TR")}</p>
              </button>
            ))}
            {threads.length === 0 && <p className="p-4 text-sm text-muted text-center">Sohbet bulunamadı</p>}
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6 overflow-y-auto max-h-[70vh]">
            {selectedThread ? (
              <div>
                <h2 className="text-lg font-bold text-heading mb-4">{selectedThread.title || "Sohbet"}</h2>
                <div className="space-y-4">
                  {selectedThread.messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] p-4 rounded-lg text-sm ${m.role === "user" ? "bg-page-hover text-body" : "bg-primary text-white"}`}>
                        <p className="text-[10px] opacity-60 mb-1 uppercase tracking-wide">{m.role === "user" ? "Müşteri" : "AI Barista"}</p>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted py-12">
                <p className="text-4xl mb-4">💬</p>
                <p>Görüntülemek için bir sohbet seçin</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
