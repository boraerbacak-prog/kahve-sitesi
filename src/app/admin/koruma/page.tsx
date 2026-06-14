"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface BlockedIp {
  id: string; ip: string; reason: string; orderCount: number;
  blockedAt: string; expiresAt: string | null; note: string | null;
}

export default function AdminKorumaPage() {
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newReason, setNewReason] = useState("manual");
  const [newNote, setNewNote] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/blocked-ips").then(r => r.json()).then(d => { if (d.blockedIps) setBlockedIps(d.blockedIps); });
  }, []);

  const blockIp = async () => {
    if (!newIp) return;
    const res = await fetch("/api/admin/blocked-ips", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: newIp, reason: newReason, note: newNote }),
    });
    if (res.ok) {
      setNewIp(""); setNewNote("");
      const d = await fetch("/api/admin/blocked-ips").then(r => r.json());
      if (d.blockedIps) setBlockedIps(d.blockedIps);
      setNotifMsg("IP engellendi ✓");
      setTimeout(() => setNotifMsg(""), 3000);
    } else {
      const err = await res.json();
      setNotifMsg(err.error || "Hata");
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const unblockIp = async (ip: string) => {
    if (!confirm(`${ip} adresinin engelini kaldırmak istediğinize emin misiniz?`)) return;
    await fetch("/api/admin/blocked-ips", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
    setBlockedIps(prev => prev.filter(b => b.ip !== ip));
    setNotifMsg("IP engeli kaldırıldı ✓");
    setTimeout(() => setNotifMsg(""), 3000);
  };

  const exportExcel = () => {
    const headers = ["IP", "Sebep", "Sipariş Sayısı", "Engellenme", "Bitiş", "Not"];
    const rows = blockedIps.map(b => [
      b.ip, b.reason === "manual" ? "Manuel" : b.reason === "rate_limit" ? "Hız Limiti" : b.reason,
      String(b.orderCount), trDate(b.blockedAt), b.expiresAt ? trDate(b.expiresAt) : "Süresiz",
      b.note || "—",
    ]);
    downloadXls(`engellenen-ip-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Engellenen IP'ler", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <Link href="/admin/detayli-rapor" className="text-sm text-amber-600 hover:underline mb-4 ml-4 inline-block">← Detaylı Rapor</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Sipariş Koruması</h1>
        <div className="flex items-center gap-3">
          {notifMsg && <span className="text-xs text-green-600 animate-pulse">{notifMsg}</span>}
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-800 mb-2">🛡️ Koruma Sistemi Aktif</h2>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Aynı kullanıcıdan 1 dakikada en fazla 3 siparişe izin verilir (kullanıcı ID bazlı)</li>
          <li>• Sipariş için giriş zorunlu olduğundan IP yerine kullanıcı bazlı limitleme daha güvenilirdir</li>
          <li>• Limit aşımında kullanıcı geçici olarak kısıtlanır, IP adresi de varsa blok listesine eklenir</li>
          <li>• IP adresi mevcut değilse bile koruma çalışmaya devam eder</li>
          <li>• Engellenen IP'ler manuel olarak da eklenebilir</li>
          <li>• Tüm siparişlerde IP adresi (varsa) kaydedilir</li>
        </ul>
      </div>

      {/* Block IP Form */}
      <div className="bg-white rounded-xl border border-amber-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-amber-900 mb-4">IP Ekle</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">IP Adresi</label>
            <input type="text" value={newIp} onChange={e => setNewIp(e.target.value)}
              placeholder="192.168.1.1"
              className="border border-amber-200 rounded-lg px-3 py-2 text-sm w-40" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Sebep</label>
            <select value={newReason} onChange={e => setNewReason(e.target.value)}
              className="border border-amber-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="manual">Manuel</option>
              <option value="suspicious">Şüpheli</option>
              <option value="fraud">Dolandırıcılık</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Not</label>
            <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)}
              placeholder="Sebep açıklaması"
              className="border border-amber-200 rounded-lg px-3 py-2 text-sm w-60" />
          </div>
          <button onClick={blockIp}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-500 transition">Engelle</button>
        </div>
      </div>

      {/* Blocked IPs Table */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <h2 className="text-lg font-bold text-amber-900 p-4 border-b border-amber-100">Engellenen IP'ler ({blockedIps.length})</h2>
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 text-amber-800">
            <th className="text-left p-4">IP</th>
            <th className="text-left p-4">Sebep</th>
            <th className="text-right p-4">Sipariş</th>
            <th className="text-left p-4">Engellenme</th>
            <th className="text-left p-4">Bitiş</th>
            <th className="text-left p-4">Not</th>
            <th className="text-left p-4"></th>
          </tr></thead>
          <tbody>
            {blockedIps.map(b => (
              <tr key={b.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4 font-mono text-sm text-gray-700">{b.ip}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.reason === "manual" ? "bg-red-100 text-red-700" : b.reason === "rate_limit" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}>
                    {b.reason === "manual" ? "Manuel" : b.reason === "rate_limit" ? "Hız Limiti" : b.reason === "suspicious" ? "Şüpheli" : b.reason}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-700">{b.orderCount}</td>
                <td className="p-4 text-gray-500 text-xs">{trDate(b.blockedAt)}</td>
                <td className="p-4 text-gray-500 text-xs">{b.expiresAt ? trDate(b.expiresAt) : "Süresiz"}</td>
                <td className="p-4 text-gray-500 text-xs max-w-[150px] truncate">{b.note || "—"}</td>
                <td className="p-4">
                  <button onClick={() => unblockIp(b.ip)}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition">Kaldır</button>
                </td>
              </tr>
            ))}
            {blockedIps.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Engellenen IP yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
