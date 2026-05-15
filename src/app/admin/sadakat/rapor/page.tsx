"use client";

import { useEffect, useState, useCallback } from "react";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
  loyalty: { user: { name: string | null; email: string } };
};

type Summary = { type: string; _sum: { amount: number | null }; _count: { amount: number } };

export default function RaporPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [totals, setTotals] = useState({ totalPoints: 0, totalSpent: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(p));
    params.set("limit", "50");

    const res = await fetch(`/api/sadakat/rapor?${params}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setSummary(data.summary || []);
    setTotals(data.totals || { totalPoints: 0, totalSpent: 0 });
    setTotal(data.total || 0);
    setPage(data.page || 1);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [q, type, from, to]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const exportCSV = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("format", "csv");
    window.open(`/api/sadakat/rapor?${params}`, "_blank");
  }, [q, type, from, to]);

  const typeLabels: Record<string, string> = {
    earn: "Kazanma",
    redeem: "Kullanma",
    welcome: "Hoş Geldin",
    birthday: "Doğum Günü",
    referral: "Referans",
    admin: "Admin",
  };

  const typeColors: Record<string, string> = {
    earn: "text-green-700 bg-green-100",
    redeem: "text-red-700 bg-red-100",
    welcome: "text-blue-700 bg-blue-100",
    birthday: "text-purple-700 bg-purple-100",
    referral: "text-orange-700 bg-orange-100",
    admin: "text-gray-700 bg-gray-100",
  };

  const totalEarned = summary.find((s) => s.type === "earn")?._sum.amount || 0;
  const totalRedeemed = Math.abs(summary.find((s) => s.type === "redeem")?._sum.amount || 0);
  const netPoints = (totals.totalPoints || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Sadakat Raporları</h1>
        <button onClick={exportCSV} className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          CSV İndir
        </button>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam İşlem</p>
          <p className="text-2xl font-bold text-amber-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <p className="text-xs text-green-600 uppercase tracking-wide">Kazanılan Puan</p>
          <p className="text-2xl font-bold text-green-700">+{Number(totalEarned).toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <p className="text-xs text-red-600 uppercase tracking-wide">Kullanılan Puan</p>
          <p className="text-2xl font-bold text-red-700">-{totalRedeemed.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Net Puan</p>
          <p className="text-2xl font-bold text-amber-900">{netPoints.toLocaleString("tr-TR")}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl border border-amber-100 p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Kullanıcı Ara</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsim veya e-posta..." className="w-full border border-[#e5e0d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">İşlem Türü</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-[#e5e0d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400">
              <option value="">Tümü</option>
              <option value="earn">Kazanma</option>
              <option value="redeem">Kullanma</option>
              <option value="welcome">Hoş Geldin</option>
              <option value="birthday">Doğum Günü</option>
              <option value="referral">Referans</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Başlangıç</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border border-[#e5e0d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bitiş</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full border border-[#e5e0d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
        </div>
        <button onClick={() => fetchData(1)} className="mt-3 bg-[#C4724B] hover:bg-[#B0603A] text-white px-4 py-2 rounded text-sm transition">
          Filtrele
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-amber-200 bg-amber-50/50">
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">Tarih</th>
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">Kullanıcı</th>
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">E-Posta</th>
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">İşlem</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">Puan</th>
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">Referans</th>
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">Not</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-amber-600">Yükleniyor...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">İşlem bulunamadı</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition">
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{tx.loyalty.user.name || "—"}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{tx.loyalty.user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${typeColors[tx.type] || "bg-gray-100 text-gray-600"}`}>
                        {typeLabels[tx.type] || tx.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-semibold ${tx.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("tr-TR")}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{tx.reference || "—"}</td>
                    <td className="py-3 px-4 text-xs text-gray-400 max-w-[200px] truncate">{tx.note || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-amber-100">
            <p className="text-xs text-gray-500">Toplam {total} işlem · Sayfa {page}/{totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => fetchData(page - 1)} className="px-3 py-1 text-xs border border-amber-200 rounded hover:bg-amber-50 disabled:opacity-30 transition">←</button>
              <button disabled={page >= totalPages} onClick={() => fetchData(page + 1)} className="px-3 py-1 text-xs border border-amber-200 rounded hover:bg-amber-50 disabled:opacity-30 transition">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
