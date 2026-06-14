"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type Tab = "pending" | "all";

export default function AdminWalletPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("pending");
  const [requests, setRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    setLoading(true);
    if (tab === "pending") {
      fetch("/api/admin/wallet")
        .then(r => r.json())
        .then(d => setRequests(d.requests || []))
        .finally(() => setLoading(false));
    } else {
      fetch("/api/admin/wallet?all=true")
        .then(r => r.json())
        .then(d => setTransactions(d.transactions || []))
        .finally(() => setLoading(false));
    }
  }, [session, tab]);

  if (!session || session.user.role !== "admin") {
    redirect("/admin");
    return null;
  }

  const confirm = async (id: string) => {
    const res = await fetch("/api/admin/wallet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "confirm" }),
    });
    if (res.ok) setRequests(prev => prev.filter(r => r.id !== id));
  };

  const cancel = async (id: string) => {
    const res = await fetch("/api/admin/wallet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    if (res.ok) setRequests(prev => prev.filter(r => r.id !== id));
  };

  const typeLabel: Record<string, string> = {
    top_up: "Para Yükleme",
    payment: "Ödeme",
    refund: "İade",
    admin_adjust: "Düzenleme",
  };

  const statusLabel: Record<string, string> = {
    completed: "Tamamlandı",
    pending: "Bekliyor",
    cancelled: "İptal",
  };

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    const matchUser = (t.user?.name || "").toLowerCase().includes(q) || (t.user?.email || "").toLowerCase().includes(q);
    const matchType = !typeFilter || t.type === typeFilter;
    return matchUser && matchType;
  });

  const totalTopUp = transactions.filter(t => t.type === "top_up" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalPayment = transactions.filter(t => t.type === "payment" && t.status === "completed").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-heading">Cüzdan Yönetimi</h1>
        {tab === "all" && transactions.length > 0 && (
          <a
            href="/api/admin/wallet?all=true&export=csv"
            className="bg-heading hover:bg-[#333] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            CSV İndir
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#f5f2ed] rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("pending")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${tab === "pending" ? "bg-white text-heading shadow-sm" : "text-muted hover:text-heading"}`}
        >
          Bekleyen Talepler {requests.length > 0 && <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${tab === "all" ? "bg-white text-heading shadow-sm" : "text-muted hover:text-heading"}`}
        >
          Tüm İşlemler
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Yükleniyor...</p>}

      {/* Bekleyen Talepler */}
      {tab === "pending" && !loading && (
        <>
          {requests.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <p className="text-muted">Bekleyen yükleme talebi yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="bg-white border border-border rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
                      {r.user?.name?.charAt(0)?.toUpperCase() || r.user?.email?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-heading">{r.user?.name || r.user?.email || "Bilinmeyen"}</p>
                      <p className="text-xs text-muted">{new Date(r.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-heading">{r.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</p>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <button onClick={() => confirm(r.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">Onayla</button>
                    <button onClick={() => cancel(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition">İptal</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tüm İşlemler */}
      {tab === "all" && !loading && (
        <>
          {/* Özet */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-border rounded-xl p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Toplam Yükleme</p>
                <p className="text-2xl font-bold text-emerald-600">{totalTopUp.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</p>
              </div>
              <div className="bg-white border border-border rounded-xl p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Toplam Harcama</p>
                <p className="text-2xl font-bold text-red-600">{totalPayment.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</p>
              </div>
            </div>
          )}

          {/* Filtreler */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kullanıcı ara..."
              className="border border-border rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-primary"
            />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Tüm İşlemler</option>
              <option value="top_up">Para Yükleme</option>
              <option value="payment">Ödeme</option>
              <option value="refund">İade</option>
              <option value="admin_adjust">Düzenleme</option>
            </select>
            <span className="text-xs text-muted">{filtered.length} işlem</span>
          </div>

          {/* Tablo */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <p className="text-muted">İşlem bulunamadı.</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-page-hover">
                    <th className="text-left px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">Tarih</th>
                    <th className="text-left px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">Kullanıcı</th>
                    <th className="text-left px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">İşlem</th>
                    <th className="text-right px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">Tutar</th>
                    <th className="text-center px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-page-hover/50 transition">
                      <td className="px-5 py-3.5 text-xs text-muted">{new Date(t.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-heading">{t.user?.name || "—"}</p>
                        <p className="text-xs text-muted">{t.user?.email || ""}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-heading">{typeLabel[t.type] || t.type}</td>
                      <td className={`px-5 py-3.5 text-sm font-semibold tabular-nums text-right ${t.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${
                          t.status === "completed" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                          t.status === "pending" ? "text-amber-600 bg-amber-50 border-amber-200" :
                          "text-red-600 bg-red-50 border-red-200"
                        }`}>
                          {statusLabel[t.status] || t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
