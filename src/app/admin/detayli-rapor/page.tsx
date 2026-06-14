"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate, tl } from "@/lib/excel";

interface ReportData {
  revenue: {
    weekly: { total: number; count: number };
    monthly: { total: number; count: number };
    yearly: { total: number; count: number };
    allTime: { total: number; count: number };
  };
  topProducts: { productId: string; name: string; slug: string; stock: number; totalSold: number; totalRevenue: number }[];
  stock: {
    outOfStock: number; lowStock: number; adequate: number; plenty: number; totalProducts: number;
    products: { id: string; name: string; slug: string; stock: number; price: number; published: boolean }[];
  };
  reviews: { id: string; rating: number; comment: string | null; approved: boolean; createdAt: string; user: { name: string | null; email: string }; product: { name: string; slug: string } }[];
  messages: { id: string; name: string; email: string; phone: string | null; subject: string; message: string; isRead: boolean; createdAt: string }[];
  blockedIps: { id: string; ip: string; reason: string; orderCount: number; blockedAt: string; expiresAt: string | null; note: string | null }[];
  charts: { weekly: { total: number; createdAt: string }[]; monthly: { total: number; createdAt: string }[] };
  summary: { totalUsers: number; totalOrders: number };
}

const periodTabs = [
  { key: "weekly", label: "Haftalık" },
  { key: "monthly", label: "Aylık" },
  { key: "yearly", label: "Yıllık" },
];

export default function DetayliRaporPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState("weekly");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [searchReview, setSearchReview] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/detayli-rapor").then(r => r.json()).then(d => setData(d));
  }, []);

  const revenue = data?.revenue;
  const currentPeriod = period as "weekly" | "monthly" | "yearly" | "allTime";

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    return data.topProducts.filter(p =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase())
    );
  }, [data, searchProduct]);

  const filteredMessages = useMemo(() => {
    if (!data) return [];
    return data.messages.filter(m =>
      m.name.toLowerCase().includes(searchMessage.toLowerCase()) ||
      m.email.toLowerCase().includes(searchMessage.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchMessage.toLowerCase())
    );
  }, [data, searchMessage]);

  const filteredReviews = useMemo(() => {
    if (!data) return [];
    return data.reviews.filter(r =>
      r.product.name.toLowerCase().includes(searchReview.toLowerCase()) ||
      r.user.name?.toLowerCase().includes(searchReview.toLowerCase())
    );
  }, [data, searchReview]);

  const exportExcel = () => {
    if (!data) return;
    const rev = (revenue as any)?.[currentPeriod] || { total: 0, count: 0 };
    const parts: string[] = [];

    // Revenue
    parts.push(htmlExcel("Ciro Raporu", ["Dönem", "Toplam Ciro", "Sipariş Sayısı"], [
      ["Haftalık", `${tl(revenue?.weekly.total || 0)}₺`, String(revenue?.weekly.count || 0)],
      ["Aylık", `${tl(revenue?.monthly.total || 0)}₺`, String(revenue?.monthly.count || 0)],
      ["Yıllık", `${tl(revenue?.yearly.total || 0)}₺`, String(revenue?.yearly.count || 0)],
      ["Tüm Zamanlar", `${tl(revenue?.allTime.total || 0)}₺`, String(revenue?.allTime.count || 0)],
    ]));

    // Top products
    parts.push(htmlExcel("En Çok Satanlar", ["Ürün", "Satılan Adet", "Toplam Ciro", "Stok"], filteredProducts.map(p => [
      esc(p.name), String(p.totalSold), `${tl(p.totalRevenue)}₺`, String(p.stock),
    ])));

    // Stock
    parts.push(htmlExcel("Stok Raporu", ["Ürün", "Stok"], data.stock.products.map(p => [
      esc(p.name), String(p.stock),
    ])));

    // Messages
    parts.push(htmlExcel("Mesajlar", ["Ad", "E-posta", "Konu", "Mesaj", "Tarih"], filteredMessages.map(m => [
      esc(m.name), esc(m.email), esc(m.subject), esc(m.message), trDate(m.createdAt),
    ])));

    // Reviews
    parts.push(htmlExcel("Yorumlar", ["Ürün", "Kullanıcı", "Puan", "Yorum", "Onay", "Tarih"], filteredReviews.map(r => [
      esc(r.product.name), esc(r.user.name || r.user.email), `${r.rating}/5`,
      esc(r.comment || "—"), r.approved ? "Evet" : "Hayır", trDate(r.createdAt),
    ])));

    downloadXls(`detayli-rapor-${new Date().toISOString().slice(0, 10)}.xls`, parts.join("<br><br>"));
  };

  if (!data) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-gray-400 text-center py-8">Yükleniyor...</p>
    </div>
  );

  const chartData = period === "weekly" ? data.charts.weekly : data.charts.monthly;
  const dailyMap: Record<string, number> = {};
  for (const d of chartData) {
    const key = period === "weekly"
      ? new Date(d.createdAt).toLocaleDateString("tr-TR", { weekday: "short" })
      : new Date(d.createdAt).toISOString().slice(0, 7);
    dailyMap[key] = (dailyMap[key] || 0) + d.total;
  }
  const chartEntries = Object.entries(dailyMap);
  const maxVal = Math.max(...chartEntries.map(([, v]) => v), 1);

  const renderStars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Detaylı Rapor</h1>
        <div className="flex items-center gap-3">
          {notifMsg && <span className="text-xs text-green-600 animate-pulse">{notifMsg}</span>}
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-6">
        {periodTabs.map(t => (
          <button key={t.key} onClick={() => setPeriod(t.key)}
            className={`text-sm px-4 py-2 rounded-lg border transition ${period === t.key ? "bg-amber-600 text-white border-amber-600" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {([
          { label: "Bu Hafta", rev: revenue?.weekly, color: "from-green-50 to-green-100 border-green-200 text-green-800" },
          { label: "Bu Ay", rev: revenue?.monthly, color: "from-blue-50 to-blue-100 border-blue-200 text-blue-800" },
          { label: "Bu Yıl", rev: revenue?.yearly, color: "from-purple-50 to-purple-100 border-purple-200 text-purple-800" },
          { label: "Tüm Zamanlar", rev: revenue?.allTime, color: "from-amber-50 to-amber-100 border-amber-200 text-amber-800" },
        ] as const).map((item) => (
          <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-xl border p-4`}>
            <p className="text-xs uppercase tracking-wide font-medium opacity-70">{item.label}</p>
            <p className="text-2xl font-bold">{tl(item.rev?.total || 0)}₺</p>
            <p className="text-xs opacity-70 mt-0.5">{item.rev?.count || 0} sipariş</p>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      {chartEntries.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Satış Grafiği ({period === "weekly" ? "Günlük" : "Aylık"})</h2>
          <div className="flex items-end gap-2 h-32 overflow-x-auto pb-2">
            {chartEntries.map(([label, val]) => (
              <div key={label} className="flex flex-col items-center gap-1 min-w-[32px]">
                <span className="text-[10px] text-gray-500 font-medium">{Math.round(val / 1000)}b</span>
                <div className="w-6 bg-amber-500 rounded-t transition-all hover:bg-amber-600" style={{ height: `${(val / maxVal) * 100}px` }} />
                <span className="text-[10px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <h2 className="text-lg font-bold text-amber-900">En Çok Satanlar</h2>
            <input type="text" placeholder="Ürün ara..." value={searchProduct} onChange={e => setSearchProduct(e.target.value)}
              className="mt-2 w-full border border-amber-200 rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead><tr className="bg-amber-50 text-amber-800 text-xs">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Ürün</th>
                <th className="text-right p-3">Satılan</th>
                <th className="text-right p-3">Ciro</th>
                <th className="text-right p-3">Stok</th>
              </tr></thead>
              <tbody>
                {filteredProducts.map((p, i) => (
                  <tr key={p.productId} className="border-b border-amber-50 hover:bg-amber-50/50">
                    <td className="p-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{p.name}</td>
                    <td className="p-3 text-right text-gray-700">{p.totalSold}</td>
                    <td className="p-3 text-right font-semibold text-amber-700">{tl(p.totalRevenue)}₺</td>
                    <td className="p-3 text-right">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Ürün yok</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Report */}
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Stok Raporu</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Tükendi", count: data.stock.outOfStock, color: "bg-red-100 text-red-700" },
              { label: "Az (1-5)", count: data.stock.lowStock, color: "bg-yellow-100 text-yellow-700" },
              { label: "Orta (6-20)", count: data.stock.adequate, color: "bg-blue-100 text-blue-700" },
              { label: "Bol (20+)", count: data.stock.plenty, color: "bg-green-100 text-green-700" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-lg p-3 text-center`}>
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="overflow-auto max-h-[260px]">
            {data.stock.products.filter(p => p.stock <= 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-amber-50 last:border-0">
                <Link href={`/admin/urunler`} className="text-sm text-gray-700 hover:text-amber-600">{p.name}</Link>
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.stock}
                </span>
              </div>
            ))}
            {data.stock.products.filter(p => p.stock <= 5).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Tüm ürünlerde stok yeterli</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-amber-100">
          <h2 className="text-lg font-bold text-amber-900">Mesajlar ({data.messages.length})</h2>
          <input type="text" placeholder="Mesajlarda ara..." value={searchMessage} onChange={e => setSearchMessage(e.target.value)}
            className="mt-2 w-full max-w-md border border-amber-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead><tr className="bg-amber-50 text-amber-800 text-xs">
              <th className="text-left p-3">Ad</th>
              <th className="text-left p-3">E-posta</th>
              <th className="text-left p-3">Konu</th>
              <th className="text-left p-3">Mesaj</th>
              <th className="text-center p-3">Durum</th>
              <th className="text-left p-3">Tarih</th>
            </tr></thead>
            <tbody>
              {filteredMessages.map(m => (
                <tr key={m.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                  <td className="p-3 font-medium text-gray-900">{m.name}</td>
                  <td className="p-3 text-gray-600">
                    <a href={`mailto:${m.email}`} className="text-amber-600 hover:underline">{m.email}</a>
                    {m.phone && <p className="text-xs text-gray-400">{m.phone}</p>}
                  </td>
                  <td className="p-3 text-gray-700 max-w-[150px] truncate">{m.subject}</td>
                  <td className="p-3 text-gray-600 max-w-[200px] truncate">{m.message}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.isRead ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {m.isRead ? "Okundu" : "Yeni"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{trDate(m.createdAt)}</td>
                </tr>
              ))}
              {filteredMessages.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-400">Mesaj yok</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-amber-100">
          <h2 className="text-lg font-bold text-amber-900">Yorumlar ({data.reviews.length})</h2>
          <input type="text" placeholder="Yorumlarda ara..." value={searchReview} onChange={e => setSearchReview(e.target.value)}
            className="mt-2 w-full max-w-md border border-amber-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead><tr className="bg-amber-50 text-amber-800 text-xs">
              <th className="text-left p-3">Ürün</th>
              <th className="text-left p-3">Kullanıcı</th>
              <th className="text-center p-3">Puan</th>
              <th className="text-left p-3">Yorum</th>
              <th className="text-center p-3">Onay</th>
              <th className="text-left p-3">Tarih</th>
            </tr></thead>
            <tbody>
              {filteredReviews.map(r => (
                <tr key={r.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                  <td className="p-3 font-medium text-gray-900">
                    <Link href={`/urunler/${r.product.slug}`} className="hover:text-amber-600">{r.product.name}</Link>
                  </td>
                  <td className="p-3 text-gray-600">{r.user.name || r.user.email}</td>
                  <td className="p-3 text-center text-amber-600 text-xs">{renderStars(r.rating)}</td>
                  <td className="p-3 text-gray-600 max-w-[250px] truncate">{r.comment || "—"}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.approved ? "Onaylı" : "Bekliyor"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{trDate(r.createdAt)}</td>
                </tr>
              ))}
              {filteredReviews.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-400">Yorum yok</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocked IPs */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <div className="p-4 border-b border-amber-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-amber-900">Engellenen IP'ler ({data.blockedIps.length})</h2>
          <Link href="/admin/koruma" className="text-xs text-amber-600 hover:underline">Koruma Yönetimi →</Link>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 text-amber-800 text-xs">
            <th className="text-left p-3">IP</th>
            <th className="text-left p-3">Sebep</th>
            <th className="text-right p-3">Sipariş</th>
            <th className="text-left p-3">Engellenme</th>
            <th className="text-left p-3">Bitiş</th>
          </tr></thead>
          <tbody>
            {data.blockedIps.map(b => (
              <tr key={b.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-3 font-mono text-xs text-gray-700">{b.ip}</td>
                <td className="p-3 text-gray-600">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.reason === "manual" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {b.reason === "manual" ? "Manuel" : b.reason === "rate_limit" ? "Hız Limiti" : b.reason}
                  </span>
                </td>
                <td className="p-3 text-right text-gray-700">{b.orderCount}</td>
                <td className="p-3 text-gray-500 text-xs">{trDate(b.blockedAt)}</td>
                <td className="p-3 text-gray-500 text-xs">{b.expiresAt ? trDate(b.expiresAt) : "Süresiz"}</td>
              </tr>
            ))}
            {data.blockedIps.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Engellenen IP yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
