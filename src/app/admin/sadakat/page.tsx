"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { tl, trDate, esc, htmlExcel, downloadXls } from "@/lib/excel";

interface Member {
  id: string; userId: string; points: number; totalSpent: number;
  birthDate: string | null; createdAt: string;
  user: { name: string | null; email: string; referralCode?: string | null };
}

interface Txn {
  id: string; amount: number; type: string; reference: string | null; note: string | null; createdAt: string;
  loyalty: { user: { name: string | null; email: string } };
}

export default function CekirdekKrediPage() {
  const [tab, setTab] = useState<"overview" | "members" | "txns">("overview");
  const [members, setMembers] = useState<Member[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [editing, setEditing] = useState<Member | null>(null);
  const [stats, setStats] = useState({ memberCount: 0, totalPoints: 0, totalSpent: 0 });
  const [search, setSearch] = useState("");

  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/sadakat/stats");
      const d = await res.json();
      if (d) setStats(prev => ({ ...prev, ...d }));
    } catch {}
  };

  const loadMembers = async () => {
    const res = await fetch("/api/sadakat/uyeler");
    const d = await res.json();
    if (d.members) setMembers(d.members);
  };

  const loadTxns = async () => {
    const res = await fetch("/api/sadakat/rapor?limit=100");
    const d = await res.json();
    if (d.transactions) setTxns(d.transactions);
    if (d.totals) setStats(prev => ({ ...prev, totalPoints: d.totals.totalPoints || 0, totalSpent: d.totals.totalSpent || 0, memberCount: d.total || 0 }));
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === "members") loadMembers();
    if (tab === "txns") loadTxns();
  }, [tab]);

  const updateMember = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch("/api/sadakat/uyeler", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) { loadMembers(); setEditing(null); }
  };

  const filteredMembers = members.filter(m =>
    (m.user.name || "").toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportMembers = () => {
    const headers = ["Ad","E-posta","Referans Kodu","Kredi (TL)","Toplam Harcama","Doğum Tarihi","Kayıt"];
    const rows = members.map(m => [
      esc(m.user.name), esc(m.user.email), esc(m.user.referralCode || "—"),
      (m.points / 100).toFixed(2), tl(m.totalSpent), m.birthDate ? trDate(m.birthDate) : "—", trDate(m.createdAt),
    ]);
    downloadXls(`cekirdek-kredi-uyeler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Çekirdek Kredi Üyeleri", headers, rows));
  };

  const exportTxns = () => {
    const headers = ["Tarih","Kullanıcı","E-posta","İşlem","Tutar (TL)","Referans","Not"];
    const typeLabels: Record<string,string> = { earn:"Kazanma",redeem:"Kullanma",referral:"Referans",admin:"Admin" };
    const rows = txns.map(t => [
      trDate(t.createdAt), esc(t.loyalty.user.name), esc(t.loyalty.user.email),
      typeLabels[t.type] || t.type, (Math.abs(t.amount) / 100).toFixed(2),
      esc(t.reference || "—"), esc(t.note || "—"),
    ]);
    downloadXls(`cekirdek-kredi-islemler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Çekirdek Kredi İşlemleri", headers, rows));
  };

  const totalPointsTL = stats.totalPoints / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Çekirdek Kredi</h1>
        <div className="flex items-center gap-3">
          {tab === "members" && <button onClick={exportMembers} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-500">Excel</button>}
          {tab === "txns" && <button onClick={exportTxns} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-500">Excel</button>}
          <Link href="/admin/sadakat/ayarlar" className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded hover:bg-amber-50">Ayarlar</Link>
          <Link href="/admin/sadakat/rapor" className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded hover:bg-amber-50">Raporlar</Link>
          <Link href="/admin" className="text-sm text-amber-600 hover:underline">← Admin Panel</Link>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {(["overview","members","txns"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-amber-600 text-white" : "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50"}`}>
            {t === "overview" ? "Genel Bakış" : t === "members" ? "Üyeler" : "İşlemler"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Üye</p>
            <p className="text-2xl font-bold text-amber-900">{stats.memberCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Kredi</p>
            <p className="text-2xl font-bold text-amber-900">{totalPointsTL.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Harcama</p>
            <p className="text-2xl font-bold text-amber-900">{tl(stats.totalSpent)} TL</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Kazanım Oranı</p>
            <p className="text-2xl font-bold text-amber-900">%5</p>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <input type="text" placeholder="İsim veya e-posta ile ara..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-sm border border-amber-200 p-2 rounded-lg text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-amber-50 border-b border-amber-100">
                <th className="text-left p-4 text-amber-800 font-medium">Kullanıcı</th>
                <th className="text-left p-4 text-amber-800 font-medium">Referans Kodu</th>
                <th className="text-right p-4 text-amber-800 font-medium">Kredi (TL)</th>
                <th className="text-right p-4 text-amber-800 font-medium">Harcama</th>
                <th className="text-left p-4 text-amber-800 font-medium">Doğum</th>
                <th className="text-left p-4 text-amber-800 font-medium">Kayıt</th>
                <th className="text-left p-4 text-amber-800 font-medium">İşlem</th>
              </tr></thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                    <td className="p-4"><p className="font-medium text-gray-900">{m.user.name || "İsimsiz"}</p><p className="text-xs text-gray-500">{m.user.email}</p></td>
                    <td className="p-4"><code className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{m.user.referralCode || "—"}</code></td>
                    <td className="p-4 text-right font-mono font-semibold text-amber-700">{(m.points / 100).toFixed(2)}</td>
                    <td className="p-4 text-right font-mono text-gray-700">{tl(m.totalSpent)}</td>
                    <td className="p-4 text-gray-500 text-xs">{m.birthDate ? trDate(m.birthDate) : "—"}</td>
                    <td className="p-4 text-gray-500 text-xs">{trDate(m.createdAt)}</td>
                    <td className="p-4">
                      <button onClick={() => setEditing(m)}
                        className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200">Düzenle</button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Üye bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "txns" && (
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-amber-50 border-b border-amber-100">
                <th className="text-left p-4 text-amber-800 font-medium">Tarih</th>
                <th className="text-left p-4 text-amber-800 font-medium">Kullanıcı</th>
                <th className="text-left p-4 text-amber-800 font-medium">İşlem</th>
                <th className="text-right p-4 text-amber-800 font-medium">Tutar (TL)</th>
                <th className="text-left p-4 text-amber-800 font-medium">Referans</th>
              </tr></thead>
              <tbody>
                {txns.map(t => {
                  const txnTL = Math.abs(t.amount) / 100;
                  return (
                    <tr key={t.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                      <td className="p-4 text-xs text-gray-500">{trDate(t.createdAt)}</td>
                      <td className="p-4 font-medium text-gray-900">{t.loyalty.user.name || t.loyalty.user.email}</td>
                      <td className="p-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        t.amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>{t.type}</span></td>
                      <td className={`p-4 text-right font-mono font-semibold ${t.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                        {t.amount > 0 ? "+" : ""}{txnTL.toFixed(2)}
                      </td>
                      <td className="p-4 text-xs text-gray-500">{t.reference || "—"}</td>
                    </tr>
                  );
                })}
                {txns.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">İşlem yok</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto py-8" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-1">Üye Düzenle</h2>
            <p className="text-xs text-gray-500 mb-1">{editing.user.name} ({editing.user.email})</p>
            <p className="text-xs text-primary font-mono mb-4">Kod: {editing.user.referralCode || "—"} · ID: {editing.userId}</p>

            {/* Kredi Bilgileri */}
            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-amber-100">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Kredi Bilgileri</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1">Kredi (TL)</label>
                  <input type="number" step="0.01"
                    value={(editing.points / 100).toFixed(2)}
                    onChange={e => {
                      const t = parseFloat(e.target.value);
                      if (!isNaN(t)) setEditing({...editing, points: Math.round(t * 100)});
                    }}
                    className="w-full border border-amber-200 p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Toplam Harcama (TL)</label>
                  <input type="number" step="0.01" value={editing.totalSpent}
                    onChange={e => setEditing({...editing, totalSpent: parseFloat(e.target.value) || 0})}
                    className="w-full border border-amber-200 p-2 rounded text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Doğum Tarihi</label>
                <input type="date" value={editing.birthDate ? editing.birthDate.slice(0,10) : ""}
                  onChange={e => setEditing({...editing, birthDate: e.target.value ? new Date(e.target.value).toISOString() : null})}
                  className="w-full border border-amber-200 p-2 rounded text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateMember(editing.id, { points: editing.points, totalSpent: editing.totalSpent, birthDate: editing.birthDate })}
                  className="px-4 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-500">Kaydet</button>
              </div>
            </div>

            {/* Manuel Kredi İşlemleri */}
            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-amber-100">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Manuel Kredi İşlemi</h3>
              <div>
                <label className="block text-gray-500 mb-1">TL Tutarı</label>
                <ManualPointManager userId={editing.userId} onDone={() => { loadMembers(); loadTxns(); }} />
              </div>
            </div>

            {/* Son İşlemler */}
            <div className="space-y-2 text-sm mb-4">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Son İşlemler</h3>
              <RecentUserTxns userId={editing.userId} />
            </div>

            <div className="flex gap-3 mt-6 justify-end border-t border-amber-100 pt-4">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-amber-200 rounded-lg text-sm">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ManualPointManager({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [action, setAction] = useState<"award" | "deduct">("award");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const num = Math.round(parseFloat(amount) * 100);
    if (!num || num <= 0) { setMsg({ ok: false, text: "Geçerli bir TL girin" }); return; }
    setLoading(true); setMsg(null);
    const res = await fetch("/api/admin/sadakat/kullanici", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, amount: num, reference: note || undefined }),
    });
    const d = await res.json();
    if (res.ok) { setMsg({ ok: true, text: `${action === "award" ? "Eklendi" : "Silindi"}: ${(num / 100).toFixed(2)} TL` }); setAmount(""); setNote(""); onDone(); }
    else { setMsg({ ok: false, text: d.error || "Hata" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => setAction("award")} className={`px-3 py-1.5 rounded text-xs font-medium ${action === "award" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>Kredi Ekle</button>
        <button onClick={() => setAction("deduct")} className={`px-3 py-1.5 rounded text-xs font-medium ${action === "deduct" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>Kredi Sil</button>
        <button onClick={async () => { if (!confirm("Emin misiniz?")) return; setLoading(true); const r = await fetch("/api/admin/sadakat/kullanici", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, action: "reset" }) }); const d = await r.json(); setMsg({ ok: r.ok, text: d.message || d.error || "Hata" }); onDone(); setLoading(false); }}
          className="px-3 py-1.5 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Sıfırla</button>
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <input type="number" step="0.01" placeholder="TL" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border border-amber-200 p-2 rounded text-sm" />
        </div>
        <div className="flex-1">
          <input type="text" placeholder="Sebep (opsiyonel)" value={note} onChange={e => setNote(e.target.value)}
            className="w-full border border-amber-200 p-2 rounded text-sm" />
        </div>
        <button onClick={submit} disabled={loading}
          className="px-4 py-2 bg-amber-600 text-white rounded text-sm hover:bg-amber-500 disabled:opacity-50">{loading ? "..." : "Uygula"}</button>
      </div>
      {msg && <p className={`text-xs ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}

function RecentUserTxns({ userId }: { userId: string }) {
  const [txns, setTxns] = useState<any[] | null>(null);
  useEffect(() => {
    fetch(`/api/sadakat/rapor?userId=${userId}&limit=10`).then(r => r.json()).then(d => { if (d.transactions) setTxns(d.transactions); }).catch(() => {});
  }, [userId]);
  if (!txns) return <p className="text-xs text-gray-400">Yükleniyor...</p>;
  if (txns.length === 0) return <p className="text-xs text-gray-400">İşlem yok</p>;
  const typeLabels: Record<string,string> = { earn:"Kazanılan", redeem:"Kullanma", referral:"Referans" };
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {txns.map((t: any) => (
        <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-amber-50 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-mono font-semibold ${t.amount > 0 ? "text-green-700" : "text-red-700"}`}>{t.amount > 0 ? "+" : ""}{(t.amount / 100).toFixed(2)} TL</span>
            <span className="text-gray-600">{typeLabels[t.type] || t.type}</span>
            {t.note && <span className="text-gray-400 truncate max-w-[120px]">{t.note}</span>}
          </div>
          <span className="text-gray-400">{new Date(t.createdAt).toLocaleDateString("tr-TR")}</span>
        </div>
      ))}
    </div>
  );
}
