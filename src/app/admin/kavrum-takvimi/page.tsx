"use client";

import { useState, useEffect, useCallback } from "react";
import { getFreshnessProfile } from "@/lib/freshness-data";
import AdminProductFormModal from "@/components/AdminProductFormModal";

interface Product {
  id: string; name: string; slug: string; stock: number;
  origin: string | null; process: string | null; roastLevel: string | null;
  roastedAt: string | null; createdAt: string;
  published: boolean;
  category: { name: string };
  status: string;
  estimatedRoastAt: string | null;
  seasonNote: string | null;
  greenBeanKg: number | null;
}

interface SalesData {
  productId: string;
  monthlyQty: number;
  monthlyRevenue: number;
}

function getPhaseInfo(o?: string | null, p?: string | null, r?: string | null) {
  const profile = getFreshnessProfile({ origin: o, process: p, roastLevel: r });
  const phases = profile.phases.map(ph => ({
    name: ph.name, nameTr: ph.nameTr,
    startDay: ph.startDay, endDay: ph.endDay,
    color: ph.name === "resting" ? "#9CA3AF" : ph.name === "prepeak" ? "#FCD34D" : ph.name === "peak" ? "#10B981" : "#F59E0B",
    emoji: ph.name === "resting" ? "⏳" : ph.name === "prepeak" ? "🌱" : ph.name === "peak" ? "✨" : "🍂",
  }));
  return { phases, peak: phases.find(ph => ph.name === "peak")!, rest: phases.find(ph => ph.name === "resting")! };
}

export default function KavrumTakvimiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "warnings" | "active" | "expiring">("warnings");
  const [now, setNow] = useState(new Date());
  const [roastQty, setRoastQty] = useState<Record<string, number>>({});
  const [notify, setNotify] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, { status: string; estimatedRoastAt: string; seasonNote: string; greenBeanKg: string }>>({});
  const [modalProduct, setModalProduct] = useState<any>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({ dailyRoastCapacity: 50, greenBeanThreshold: 20 });
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    const [pr, ps, pc, ps2] = await Promise.all([
      fetch("/api/admin/products").then(r => r.json()),
      fetch("/api/admin/products/roast/sales").then(r => r.json()).catch(() => ({ sales: [] })),
      fetch("/api/categories").then(r => r.json()).catch(() => ({ categories: [] })),
      fetch("/api/sadakat/ayarlar").then(r => r.json()).catch(() => ({})),
    ]);
    if (pr.products) setProducts(pr.products);
    if (ps.sales) setSales(ps.sales);
    if (pc.categories) setCategories(pc.categories);
    if (ps2.dailyRoastCapacity) setGlobalSettings({ dailyRoastCapacity: ps2.dailyRoastCapacity, greenBeanThreshold: ps2.greenBeanThreshold ?? 20 });
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const doRoast = async (productId: string, name: string) => {
    const qty = roastQty[productId] || 50;
    const shouldNotify = notify[productId] || false;
    setLoading(productId);
    try {
      const res = await fetch("/api/admin/products/roast", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stockIncrease: qty, notify: shouldNotify }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Hata"); }
      else await load();
    } catch (e) { alert("Hata oluştu"); }
    setLoading(null);
  };

  const startEdit = (p: Product & { status?: string; estimatedRoastAt?: string | null; seasonNote?: string | null; greenBeanKg?: number | null }) => {
    setEditingId(p.id);
    setEditForm(prev => ({
      ...prev,
      [p.id]: {
        status: p.status || "active",
        estimatedRoastAt: p.estimatedRoastAt ? p.estimatedRoastAt.split("T")[0] : "",
        seasonNote: p.seasonNote || "",
        greenBeanKg: p.greenBeanKg?.toString() || "",
      },
    }));
  };

  const saveDetails = async (productId: string) => {
    const form = editForm[productId];
    if (!form) return;
    setLoading(productId);
    try {
      const body: Record<string, unknown> = { id: productId, status: form.status };
      if (form.estimatedRoastAt) body.estimatedRoastAt = new Date(form.estimatedRoastAt + "T12:00:00").toISOString();
      else body.estimatedRoastAt = null;
      body.seasonNote = form.seasonNote || null;
      body.greenBeanKg = form.greenBeanKg ? parseFloat(form.greenBeanKg) : null;
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || "Hata"); }
      else { setEditingId(null); await load(); }
    } catch (e) { alert("Hata oluştu"); }
    setLoading(null);
  };

  const salesMap = new Map(sales.map(s => [s.productId, s]));

  const enriched = products
    .filter(p => p.published)
    .map(p => {
      const s = salesMap.get(p.id);
      const info = getPhaseInfo(p.origin, p.process, p.roastLevel);
      const roastDate = p.roastedAt ? new Date(p.roastedAt) : null;
      const day = roastDate ? Math.floor((now.getTime() - roastDate.getTime()) / (1000 * 60 * 60 * 24)) : -1;
      const currentPhase = day >= 0
        ? info.phases.find(ph => day >= ph.startDay && day < ph.endDay) || info.phases[info.phases.length - 1]
        : null;
      const daysToPeak = currentPhase && currentPhase.name !== "peak" ? info.peak.startDay - day : 0;
      const daysLeftInPeak = currentPhase?.name === "peak" ? info.peak.endDay - day : 0;
      const needsRoast = p.stock <= 0 || (currentPhase?.name === "maturity");
      const peakEndingSoon = currentPhase?.name === "peak" && daysLeftInPeak > 0 && daysLeftInPeak <= 5;
      const stockLow = p.stock > 0 && p.stock <= 10 && currentPhase?.name !== "peak";
      const warning = needsRoast || peakEndingSoon || stockLow;
      const suggestedQty = s ? Math.ceil((s.monthlyQty || 30) * 1.3) : 50;
      return { ...p, s, info, day, currentPhase, daysToPeak, daysLeftInPeak, roastDate, needsRoast, peakEndingSoon, stockLow, warning, suggestedQty };
    })
    .filter(p => {
      if (filter === "warnings") return p.warning;
      if (filter === "active") return p.currentPhase?.name === "peak";
      if (filter === "expiring") return p.daysLeftInPeak > 0 && p.daysLeftInPeak <= 7;
      return true;
    })
    .sort((a, b) => {
      if (a.needsRoast !== b.needsRoast) return a.needsRoast ? -1 : 1;
      if (a.peakEndingSoon !== b.peakEndingSoon) return a.peakEndingSoon ? -1 : 1;
      if (a.stockLow !== b.stockLow) return a.stockLow ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const filters = [
    { key: "warnings", label: "⚠️ Uyarılar" },
    { key: "all", label: "Tümü" },
    { key: "active", label: "Zirvede" },
    { key: "expiring", label: "Bitecek (≤7)" },
  ] as const;

  const warningCount = enriched.filter(p => filter === "warnings").length;
  const totalCount = products.filter(p => p.published).length;

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch("/api/sadakat/ayarlar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalSettings),
      });
    } catch {}
    setSavingSettings(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2c1810]">Kavurma Takvimi</h1>
          <p className="text-sm text-[#8c8c8c] mt-1">
            {totalCount} ürün · {warningCount} işlem bekliyor
            <span className="ml-2 text-[10px]">(Her dakika otomatik güncellenir)</span>
          </p>
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                filter === f.key ? "bg-[#C4724B] text-white" : "bg-white text-[#666] border border-[#e5e0d8] hover:border-[#C4724B]"
              }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Ayarlar Paneli */}
      <div className="mb-6 bg-white border border-[#e5e0d8]">
        <button onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-[#666] uppercase tracking-wider hover:text-[#2c1810] transition">
          <span>⚙️ Sistem Ayarları</span>
          <span>{settingsOpen ? "−" : "+"}</span>
        </button>
        {settingsOpen && (
          <div className="px-4 pb-4 border-t border-[#e5e0d8] pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-[#8c8c8c] uppercase tracking-wider mb-1">Günlük Kavrum Kapasitesi</label>
                <p className="text-[10px] text-[#aaa] mb-1">Aşılınca teslimat süresi otomatik uzar</p>
                <input type="number" min={1} value={globalSettings.dailyRoastCapacity}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, dailyRoastCapacity: parseInt(e.target.value) || 50 }))}
                  className="w-full text-xs border border-[#e5e0d8] px-2 py-1.5 focus:outline-none focus:border-[#C4724B]" />
              </div>
              <div>
                <label className="block text-[10px] text-[#8c8c8c] uppercase tracking-wider mb-1">Tükenmek Üzere Eşiği (kg)</label>
                <p className="text-[10px] text-[#aaa] mb-1">Altındaki yeşil çekirdekte rozet gösterilir</p>
                <input type="number" min={1} step="0.1" value={globalSettings.greenBeanThreshold}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, greenBeanThreshold: parseFloat(e.target.value) || 20 }))}
                  className="w-full text-xs border border-[#e5e0d8] px-2 py-1.5 focus:outline-none focus:border-[#C4724B]" />
              </div>
              <div className="flex items-end">
                <button onClick={saveSettings} disabled={savingSettings}
                  className="px-4 py-1.5 text-xs font-medium bg-[#C4724B] text-white hover:bg-[#B0603A] transition disabled:opacity-50">
                  {savingSettings ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalProduct && (
        <AdminProductFormModal
          product={modalProduct}
          categories={categories}
          onClose={() => setModalProduct(null)}
          onSave={() => { setModalProduct(null); load(); }}
          onDelete={() => { setModalProduct(null); load(); }}
        />
      )}

      <div className="space-y-3">
        {enriched.map(p => (
          <div key={p.id} className={`bg-white border p-4 ${p.warning ? "border-amber-300" : "border-[#e5e0d8]"} ${p.needsRoast ? "border-l-4 border-l-red-400" : p.peakEndingSoon ? "border-l-4 border-l-amber-400" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-[#2c1810]">{p.name}</h3>
                    <span className="text-[10px] text-[#8c8c8c] bg-[#f8f6f3] px-1.5 py-0.5">{p.category?.name}</span>
                    {p.origin && <span className="text-[10px] text-[#8c8c8c]">{p.origin}</span>}
                    {p.status === "coming_soon" && <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 font-medium">Yakında</span>}
                    {p.status === "archived" && <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 font-medium">Arşiv</span>}
                    {p.greenBeanKg !== null && p.greenBeanKg !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 font-medium ${p.greenBeanKg < 20 ? "text-red-700 bg-red-50" : "text-green-700 bg-green-50"}`}>
                        {p.greenBeanKg} kg çekirdek
                      </span>
                    )}
                  </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666]">
                  {p.roastDate ? (
                    <>
                      <span>Kavrum: <strong>{p.roastDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</strong> · <strong>{p.day}. gün</strong></span>
                      {p.currentPhase && (
                        <span style={{ color: p.currentPhase.color }}>
                          {p.currentPhase.emoji} {p.currentPhase.nameTr}
                        </span>
                      )}
                      {p.currentPhase?.name === "peak" ? (
                        <span className="text-green-600 font-medium">Zirvede · {p.daysLeftInPeak} gün kaldı</span>
                      ) : p.day >= 0 ? (
                        <span className="text-amber-600">{p.daysToPeak} gün sonra zirve</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-red-500 font-medium">⚠ Kavrum yapılmadı</span>
                  )}
                  <span className={`font-semibold ${p.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    Stok: {p.stock} adet
                  </span>
                  {p.s && (
                    <span className="text-[#8c8c8c]">Aylık satış: ~{p.s.monthlyQty} adet</span>
                  )}
                </div>

                {p.peakEndingSoon && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1">
                    ⏰ Zirve bitiyor! {p.daysLeftInPeak} gün sonra olgunluk evresine geçecek. Yeni kavrum planlayın.
                  </div>
                )}
                {p.stockLow && (
                  <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1">
                    📦 Stok azalıyor! Sadece {p.stock} adet kaldı.
                  </div>
                )}
                {p.needsRoast && (
                  <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1">
                    🔴 Kavrum gerekli! Stok tükendi veya olgunluk evresinde.
                  </div>
                )}
                {p.estimatedRoastAt && p.status === "coming_soon" && (
                  <div className="mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-1">
                    📅 Tahmini kavrum: {new Date(p.estimatedRoastAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                )}
                {p.seasonNote && (
                  <div className="mt-1 text-xs text-[#666] bg-[#f8f6f3] px-2 py-1 italic">
                    "{p.seasonNote}"
                  </div>
                )}
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center gap-2 mb-2">
                  <input type="number" min={10} max={500}
                    className="w-16 text-xs text-center border border-[#e5e0d8] px-1 py-1"
                    placeholder="50"
                    value={roastQty[p.id] || ""}
                    onChange={e => setRoastQty(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 50 }))}
                  />
                  <span className="text-[10px] text-[#8c8c8c]">adet</span>
                  <label className="flex items-center gap-1 text-[10px] text-[#8c8c8c] cursor-pointer">
                    <input type="checkbox" checked={notify[p.id] || false}
                      onChange={e => setNotify(prev => ({ ...prev, [p.id]: e.target.checked }))}
                    />
                    Bildirim
                  </label>
                </div>
                <div className="text-[10px] text-[#8c8c8c] mb-2">
                  Önerilen: <strong>{p.suggestedQty} adet</strong>
                  {p.s && <span> (ayda ~{p.s.monthlyQty} satılıyor)</span>}
                </div>
                  <button onClick={() => doRoast(p.id, p.name)} disabled={loading === p.id}
                    className="px-4 py-2 text-xs font-medium bg-[#2c1810] text-white hover:bg-[#4a3426] transition uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading === p.id ? "Kavruluyor..." : "Kavrum Yap"}
                  </button>
                </div>
              </div>

              {editingId === p.id ? (
                <div className="mt-4 pt-4 border-t border-[#e5e0d8]">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] text-[#8c8c8c] uppercase tracking-wider mb-1">Durum</label>
                      <select value={editForm[p.id]?.status || "active"} onChange={e => setEditForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], status: e.target.value } }))}
                        className="w-full text-xs border border-[#e5e0d8] px-2 py-1.5 bg-white focus:outline-none focus:border-[#C4724B]">
                        <option value="active">Aktif</option>
                        <option value="coming_soon">Yakında</option>
                        <option value="archived">Arşiv</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8c8c8c] uppercase tracking-wider mb-1">Tahmini Kavrum</label>
                      <input type="date" value={editForm[p.id]?.estimatedRoastAt || ""} onChange={e => setEditForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], estimatedRoastAt: e.target.value } }))}
                        className="w-full text-xs border border-[#e5e0d8] px-2 py-1.5 focus:outline-none focus:border-[#C4724B]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8c8c8c] uppercase tracking-wider mb-1">Yeşil Çekirdek (kg)</label>
                      <input type="number" min={0} step="0.1" value={editForm[p.id]?.greenBeanKg || ""} onChange={e => setEditForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], greenBeanKg: e.target.value } }))}
                        className="w-full text-xs border border-[#e5e0d8] px-2 py-1.5 focus:outline-none focus:border-[#C4724B]" />
                    </div>
                    <div className="flex items-end gap-2">
                      <button onClick={() => saveDetails(p.id)} disabled={loading === p.id}
                        className="px-3 py-1.5 text-xs font-medium bg-[#C4724B] text-white hover:bg-[#B0603A] transition disabled:opacity-50">
                        {loading === p.id ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-[#666] border border-[#e5e0d8] hover:bg-[#f8f6f3] transition">
                        İptal
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8c8c8c] uppercase tracking-wider mb-1">Sezon Notu</label>
                    <textarea rows={2} value={editForm[p.id]?.seasonNote || ""} onChange={e => setEditForm(prev => ({ ...prev, [p.id]: { ...prev[p.id], seasonNote: e.target.value } }))}
                      className="w-full text-xs border border-[#e5e0d8] px-2 py-1.5 focus:outline-none focus:border-[#C4724B] resize-none" />
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button onClick={() => setModalProduct(p)} className="text-[10px] text-[#8c8c8c] hover:text-[#2c1810] transition uppercase tracking-wider">Tam Düzenle</button>
                  <span className="text-[10px] text-[#e5e0d8]">|</span>
                  <button onClick={() => startEdit(p)} className="text-[10px] text-[#8c8c8c] hover:text-[#C4724B] transition uppercase tracking-wider">Hızlı Düzenle</button>
                </div>
              )}
          </div>
        ))}
        {enriched.length === 0 && (
          <div className="text-center py-12 text-[#8c8c8c] text-sm">Eşleşen ürün yok</div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#8c8c8c]">
        <span>🔴 Kırmızı sol çizgi = işlem gerekli</span>
        <span>🟡 Amber sol çizgi = zirve bitiyor</span>
        <span>⚠ Sarı arkaplan = dikkat edilmesi gereken</span>
        <span>✅ Her dakika otomatik güncellenir</span>
        <a href="/blog/kavrum-profilleri" className="text-[#C4724B] hover:underline font-medium">❓ Neden beklemeliyim? →</a>
      </div>
    </div>
  );
}
