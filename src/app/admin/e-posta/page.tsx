"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { trDateTime, esc, htmlExcel, downloadXls } from "@/lib/excel";

type Target = "subscribers" | "active_subscribers" | "loyalty_members" | "all_users";

export default function EPostaPage() {
  const [form, setForm] = useState({ subject: "", body: "" });
  const [target, setTarget] = useState<Target>("subscribers");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [logs, setLogs] = useState<{ id: string; subject: string; recipientCount: number; sentAt: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/e-posta/log").then(r => r.json()).then(d => { if (d.logs) setLogs(d.logs); });
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult("");
    const res = await fetch("/api/admin/e-posta", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, target }),
    });
    const data = await res.json();
    if (res.ok) { setResult(`${data.recipientCount} kişiye e-posta gönderildi`); setForm({ subject: "", body: "" }); }
    else setResult(data.error || "Hata");
    setSending(false);
  };

  const targetLabels: Record<Target, string> = {
    subscribers: "Tüm E-Posta Aboneleri",
    active_subscribers: "Aktif E-Posta Aboneleri",
    loyalty_members: "Çekirdek Kredi Üyeleri (Tümü)",  
    all_users: "Tüm Kayıtlı Kullanıcılar",
  };

  const exportLogs = () => {
    const headers = ["Tarih", "Konu", "Alıcı Sayısı"];
    const rows = logs.map(l => [trDateTime(l.sentAt), esc(l.subject), String(l.recipientCount)]);
    downloadXls(`e-posta-gecmis-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("E-Posta Geçmişi", headers, rows));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Toplu E-Posta Gönder</h1>

      <form onSubmit={send} className="bg-white rounded-xl border border-amber-100 p-6 mb-8 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Hedef Kitle</label>
          <select value={target} onChange={e => setTarget(e.target.value as Target)}
            className="w-full border border-amber-200 p-3 rounded-lg text-sm">
            {Object.entries(targetLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Konu</label>
          <input type="text" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            className="w-full border border-amber-200 p-3 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">İçerik (düz metin)</label>
          <textarea required value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={8}
            className="w-full border border-amber-200 p-3 rounded-lg text-sm" />
        </div>
        {result && <p className="text-sm text-green-600">{result}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={sending}
            className="bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-amber-500 disabled:opacity-50">
            {sending ? "Gönderiliyor..." : "Gönder"}
          </button>
          <span className="text-xs text-gray-400">{targetLabels[target]}'ye gönder</span>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-amber-900">Geçmiş Gönderiler</h2>
        <button onClick={exportLogs} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500">Excel</button>
      </div>
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Tarih</th><th className="text-left p-4">Konu</th><th className="text-left p-4">Alıcı</th>
          </tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-b border-amber-50">
                <td className="p-4 text-xs text-gray-500">{trDateTime(l.sentAt)}</td>
                <td className="p-4 font-medium text-gray-900">{l.subject}</td>
                <td className="p-4">{l.recipientCount}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-400">Henüz gönderi yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
