"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; slug: string };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDeliveryDate: string | null;
  items: OrderItem[];
}

interface SubscriptionPlan {
  name: string;
  price: number;
  packageCount: number;
  packageSize: number;
}

interface FullSubscription {
  id: string;
  status: string;
  startDate: string;
  nextDelivery: string | null;
  flavorProfile: string | null;
  roastPreference: string | null;
  brewMethod: string;
  deliveryFrequency: string;
  packageCount: number | null;
  plan: SubscriptionPlan;
  deliveries: {
    id: string;
    status: string;
    roastDate: string | null;
    shipDate: string | null;
    deliveredDate: string | null;
    createdAt: string;
    items: { id: string; product: { id: string; name: string; slug: string; origin: string | null; region: string | null; altitude: string | null; process: string | null; variety: string | null; grade: string | null; flavorNotes: string | null; roastLevel: string | null; body: string | null; acidity: string | null; } }[];
  }[];
}

interface LoyaltyData {
  points: number;
  tier: string;
  totalSpent: number;
  tierDiscountPct: number;
}

function AddressSection() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "default", fullName: "", address: "", city: "", phone: "", isDefault: false });

  const load = () => fetch("/api/adres").then(r => r.json()).then(d => { if (d.addresses) setAddresses(d.addresses); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.fullName || !form.address || !form.city || !form.phone) return;
    const isNew = !editing;
    const res = await fetch("/api/adres", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isNew ? form : { ...form, id: editing.id }),
    });
    if (res.ok) { setShowForm(false); setEditing(null); setForm({ name: "default", fullName: "", address: "", city: "", phone: "", isDefault: false }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    await fetch("/api/adres", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const edit = (a: any) => { setEditing(a); setForm(a); setShowForm(true); };

  return (
    <div className="bg-white border border-border p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-heading">Adreslerim</h2>
        <button onClick={() => { setEditing(null); setForm({ name: "default", fullName: "", address: "", city: "", phone: "", isDefault: false }); setShowForm(!showForm); }}
          className="text-sm text-primary hover:text-primary-hover font-medium">{showForm ? "İptal" : "+ Yeni Adres"}</button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-page-hover rounded-lg border border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Ad Soyad</label>
              <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                className="w-full border border-border p-2 rounded text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Telefon</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-border p-2 rounded text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Adres</label>
            <textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              className="w-full border border-border p-2 rounded text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Şehir</label>
              <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full border border-border p-2 rounded text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Adres Etiketi</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-border p-2 rounded text-sm focus:outline-none focus:border-primary" placeholder="Ev, İş" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="accent-primary" />
            Varsayılan adres
          </label>
          <button onClick={save}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded text-sm font-medium transition">
            {editing ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-sm text-muted">Henüz adres eklemediniz.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a: any) => (
            <div key={a.id} className="flex items-start justify-between p-3 bg-page-hover rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-heading">{a.fullName}</p>
                <p className="text-xs text-body">{a.address}, {a.city}</p>
                <p className="text-xs text-muted">{a.phone}</p>
                {a.isDefault && <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Varsayılan</span>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => edit(a)} className="text-xs text-primary hover:underline">Düzenle</button>
                <button onClick={() => remove(a.id)} className="text-xs text-red-500 hover:underline">Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoyaltyTab() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/sadakat/detay").then(r => r.json()).then(d => { if (d.availableTL !== undefined) setData(d); }).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-xl text-primary font-bold">%5</span>
        </div>
        <p className="text-body mb-4">Henüz kredi bilgin bulunmuyor.</p>
        <Link href="/urunler" className="text-primary hover:text-primary-hover text-sm font-medium hover:underline">Alışverişe Başla →</Link>
      </div>
    );
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-border p-4 sm:p-5 text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider">Kullanılabilir</p>
          <p className="text-2xl sm:text-3xl font-bold text-heading mt-1">{data.availableTL.toFixed(2)} TL</p>
        </div>
        <div className="bg-white border border-border p-4 sm:p-5 text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider">Bekleyen</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">{data.pendingTL.toFixed(2)} TL</p>
        </div>
        <div className="bg-white border border-border p-4 sm:p-5 text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider">Toplam Harcama</p>
          <p className="text-2xl sm:text-3xl font-bold text-heading mt-1">{data.totalSpent.toLocaleString("tr-TR")} TL</p>
        </div>
        <div className="bg-white border border-border p-4 sm:p-5 text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider">Kredi Oranı</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">%{data.earnRate}</p>
        </div>
      </div>

      <div className="bg-white border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-heading">Aylık Kredi Kazanımı</p>
          <p className="text-xs text-muted">{data.monthlyEarnedTL.toFixed(2)} TL / {data.monthlyCapTL.toFixed(0)} TL</p>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${data.monthlyProgressPct >= 80 ? "bg-red-500" : data.monthlyProgressPct >= 50 ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${data.monthlyProgressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-muted mt-1.5">
          {data.monthlyProgressPct >= 100
            ? "Bu ayki kazanım sınırına ulaştınız."
            : `Bu ay ${data.monthlyCapTL.toFixed(0)} TL'ye kadar kredi kazanabilirsiniz.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
        <div className="bg-white border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Arkadaşını Getir</p>
              <p className="text-lg font-bold text-heading mt-1">
                {data.referralTotal > 0 ? `${data.referralTotal} Davet` : "Henüz davet yok"}
              </p>
            </div>
            {data.referralPending > 0 && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded">{data.referralPending} Bekleyen</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <code className="text-sm font-bold tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded select-all">
              {data.referralCode}
            </code>
            <button onClick={() => copyCode(data.referralCode)}
              className="text-xs text-primary hover:underline font-medium whitespace-nowrap">
              {copied ? "Kopyalandı ✓" : "Kopyala"}
            </button>
          </div>
          <p className="text-[10px] text-muted mt-2 leading-relaxed">
            Davet kodunu arkadaşınla paylaş, ilk alışverişinde sana 100 TL kredi kazandırsın.
          </p>
        </div>
      </div>

      <div className="bg-white border border-border p-5 sm:p-6">
        <h2 className="text-sm font-bold text-heading mb-4">Kredi Hareketleri</h2>
        {data.transactions?.length > 0 ? (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {data.transactions.map((tx: any) => {
              const typeLabels: Record<string, string> = {
                earn: "Kazanılan", redeem: "Kullanma",
                referral: "Referans",
              };
              return (
                <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0 text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold min-w-[70px] text-center ${
                      tx.amount > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {tx.amount > 0 ? "+" : ""}{(tx.amount / 100).toFixed(2)} TL
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-body">{typeLabels[tx.type] || tx.type}</span>
                      {tx.status === "pending" && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">bekliyor</span>}
                      {tx.status === "refunded" && <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">iade</span>}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted">{new Date(tx.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-8">Henüz işlem yok.</p>
        )}
      </div>

      <div className="text-center">
        <Link href="/sadakat" className="text-primary hover:text-primary-hover text-sm font-medium hover:underline">
          Çekirdek Kredi Kuralları ve Detaylar →
        </Link>
      </div>
    </div>
  );
}

function HarvestArchive({ subscriptions }: { subscriptions: FullSubscription[] }) {
  type HarvestProduct = FullSubscription["deliveries"][0]["items"][0]["product"];
  const harvestMap = new Map<string, { product: HarvestProduct; deliveries: { date: string; label: string; deliveryId: string }[] }>();

  subscriptions.forEach(sub => {
    (sub.deliveries || []).forEach((delivery, idx) => {
      const cycleNumber = sub.deliveries.length - idx;
      delivery.items.forEach(item => {
        const key = item.product.id;
        if (!harvestMap.has(key)) {
          harvestMap.set(key, { product: item.product, deliveries: [] });
        }
        harvestMap.get(key)!.deliveries.push({
          date: delivery.deliveredDate || delivery.shipDate || delivery.createdAt,
          label: `${cycleNumber}. döngü · ${new Date(delivery.deliveredDate || delivery.shipDate || delivery.createdAt).toLocaleDateString("tr-TR")}`,
          deliveryId: delivery.id,
        });
      });
    });
  });

  const entries = Array.from(harvestMap.values()).sort((a, b) => {
    const aLatest = a.deliveries.reduce((latest, d) => d.date > latest.date ? d : latest, a.deliveries[0]);
    const bLatest = b.deliveries.reduce((latest, d) => d.date > latest.date ? d : latest, b.deliveries[0]);
    return new Date(bLatest.date).getTime() - new Date(aLatest.date).getTime();
  });

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-lg text-primary font-bold">🌱</span>
        </div>
        <p className="text-body mb-2">Henüz hasat arşivi oluşmamış.</p>
        <p className="text-xs text-muted">Abonelik teslimatların tamamlandıkça burada birikecek.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {entries.map(entry => {
        const p = entry.product;
        const roastLabel = ROAST_LABELS[p.roastLevel || ""] || p.roastLevel || "—";
        return (
          <div key={p.id} className="bg-white border border-border p-5 sm:p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-base font-bold text-heading leading-snug">{p.name}</h3>
              <span className="text-[10px] uppercase tracking-wider text-primary font-semibold whitespace-nowrap shrink-0">{roastLabel}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
              {p.origin && <><span className="text-muted">Köken</span><span className="text-heading font-medium text-right">{p.origin}</span></>}
              {p.region && <><span className="text-muted">Bölge</span><span className="text-heading font-medium text-right">{p.region}</span></>}
              {p.altitude && <><span className="text-muted">Rakım</span><span className="text-heading font-medium text-right">{p.altitude}</span></>}
              {p.process && <><span className="text-muted">İşleme</span><span className="text-heading font-medium text-right">{p.process}</span></>}
              {p.variety && <><span className="text-muted">Tür</span><span className="text-heading font-medium text-right">{p.variety}</span></>}
              {p.grade && <><span className="text-muted">Grade</span><span className="text-heading font-medium text-right">{p.grade}</span></>}
            </div>

            {p.flavorNotes && (
              <div className="mb-3">
                <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Lezzet Notları</p>
                <p className="text-xs text-body/80 italic leading-relaxed">{p.flavorNotes}</p>
              </div>
            )}

            {p.body && p.acidity && (
              <div className="flex gap-4 text-xs mb-3">
                {p.body && <span className="text-muted">Body: <span className="text-heading font-medium">{p.body}</span></span>}
                {p.acidity && <span className="text-muted">Asidite: <span className="text-heading font-medium">{p.acidity}</span></span>}
              </div>
            )}

            <div className="mt-auto pt-3 border-t border-border">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">Gönderildiği Teslimatlar</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.deliveries.map(d => (
                  <span key={d.deliveryId} className="text-[10px] bg-page-hover text-body px-2 py-0.5 rounded">{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const BREW_LABELS: Record<string, string> = {
  filter: "Filtre", espresso: "Espresso", turk: "Türk Kahvesi", french: "French Press", chemex: "Chemex",
};
const FLAVOR_LABELS: Record<string, string> = {
  fruity: "Meyvemsi", balanced: "Dengeli", chocolate: "Çikolata", meyvemsi: "Meyvemsi", dengeli: "Dengeli", cikolata: "Çikolata",
};
const ROAST_LABELS: Record<string, string> = {
  light: "Zarif", medium: "İdeal", dark: "Karakterli", acik: "Zarif", orta: "İdeal", koyu: "Karakterli",
};
const FREQ_LABELS: Record<string, string> = {
  weekly: "Haftada Bir", biweekly: "2 Haftada Bir", monthly: "Ayda Bir",
};
const FREQ_DAYS: Record<string, number> = {
  weekly: 7, biweekly: 14, monthly: 30,
};

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function HesabimContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "orders" | "subscriptions" | "profile" | "loyalty" | "wallet" | "harvest") || "orders";
  const deliveryParam = searchParams.get("delivery");
  const [showDeliveryMsg, setShowDeliveryMsg] = useState(!!deliveryParam);
  const [tab, setTab] = useState<"orders" | "subscriptions" | "profile" | "loyalty" | "wallet" | "harvest">(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<FullSubscription[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/siparislerim").then(r => r.json()).then(d => { if (d.orders) setOrders(d.orders); });
    fetch("/api/abonelik/my").then(r => r.json()).then(d => { if (d.subscriptions) setSubscriptions(d.subscriptions); });
    fetch("/api/sadakat/puan").then(r => r.json()).then(d => { if (d.points !== undefined) setLoyalty(d); }).catch(() => {});
    fetch("/api/wallet").then(r => r.json()).then(d => { if (d.balance !== undefined) setWalletBalance(d.balance); }).catch(() => {});
  }, []);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-6xl animate-pulse">☕</span></div>;
  }

  if (!session) return null;

  const activeSub = subscriptions.find(s => s.status === "active") || null;
  const deliveredCount = activeSub?.deliveries.filter(d => d.status === "delivered").length || 0;
  const cycleNumber = deliveredCount + 1;

  const profileParts: string[] = [];
  if (activeSub) {
    if (activeSub.packageCount) profileParts.push(`${activeSub.packageCount} Paket`);
    const brewLabel = BREW_LABELS[activeSub.brewMethod] || activeSub.brewMethod;
    if (brewLabel) profileParts.push(brewLabel);
    const flavorLabel = FLAVOR_LABELS[activeSub.flavorProfile || ""] || activeSub.flavorProfile;
    if (flavorLabel) profileParts.push(flavorLabel);
    const roastLabel = ROAST_LABELS[activeSub.roastPreference || ""] || activeSub.roastPreference;
    if (roastLabel) profileParts.push(roastLabel);
  }

  const doAction = async (action: string, body: object) => {
    setActionMsg(null);
    setActionLoading(action);
    try {
      const res = await fetch(`/api/abonelik/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: "success", text: "İşlem başarılı." });
        const updated = await fetch("/api/abonelik/my").then(r => r.json());
        if (updated.subscriptions) setSubscriptions(updated.subscriptions);
      } else {
        setActionMsg({ type: "error", text: data.error || "İşlem başarısız" });
      }
    } catch {
      setActionMsg({ type: "error", text: "Bir hata oluştu." });
    }
    setActionLoading(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Hesabım</span>
          <h1 className="text-3xl font-bold text-heading mt-2">Merhaba, {session.user?.name || "Kahvesever"}</h1>
        </div>
        <div className="flex gap-2">
          {session.user?.email === "admin@kahveci.com" && (
            <Link href="/admin" className="text-xs bg-heading text-white px-4 py-2 uppercase tracking-wider hover:bg-[#333] transition">
              Admin Paneli
            </Link>
          )}
          <Link href="/abonelik/yonetim" className="text-xs bg-primary text-white px-4 py-2 uppercase tracking-wider hover:bg-primary-hover transition">
            Aboneliğim
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs border border-red-200 text-red-600 px-4 py-2 uppercase tracking-wider hover:bg-red-50 transition">
            Çıkış Yap
          </button>
        </div>
      </div>

      {showDeliveryMsg && deliveryParam && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">Siparişiniz başarıyla alındı!</p>
            <p className="text-xs text-green-700 mt-0.5">
              Tahmini teslimat: <strong>{new Date(deliveryParam).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</strong>
            </p>
          </div>
          <button onClick={() => setShowDeliveryMsg(false)} className="text-green-600 hover:text-green-800 text-lg leading-none">×</button>
        </div>
      )}

      {actionMsg && (
        <div className={`mb-8 p-4 flex items-center justify-between border ${actionMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"}`}>
          <span className="text-sm">{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-lg leading-none">&times;</button>
        </div>
      )}

      {activeSub && (
        <div className="bg-card border border-border p-6 sm:p-8 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <p className="text-lg font-semibold text-heading">
                Merhaba {session.user?.name?.split(" ")[0] || "Kahvesever"},
              </p>
              <p className="text-sm text-body/70 mt-1">
                Stello şu anda <strong>{cycleNumber}. döngünü</strong> yönetiyor.
              </p>
              {activeSub.nextDelivery && (
                <p className="text-sm text-body/70 mt-0.5">
                  Bir sonraki sevkiyat: <strong>{new Date(activeSub.nextDelivery).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</strong>
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-body/80">
                <span className="text-xs tracking-[0.1em] uppercase text-muted">Aktif Profil</span>
                <span className="text-sm font-medium text-heading">{profileParts.join(" · ")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-border">
            <button
              onClick={() => doAction("postpone", { subscriptionId: activeSub.id })}
              disabled={actionLoading !== null}
              className="inline-flex items-center gap-2 bg-white border border-border hover:border-primary/40 text-heading px-5 py-2.5 text-sm font-medium transition disabled:opacity-50"
            >
              {actionLoading === "postpone" ? (
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              ↻ 1 Hafta Ertele
            </button>
            <button
              onClick={() => doAction("expedite", { subscriptionId: activeSub.id })}
              disabled={actionLoading !== null}
              className="inline-flex items-center gap-2 bg-white border border-border hover:border-primary/40 text-heading px-5 py-2.5 text-sm font-medium transition disabled:opacity-50"
            >
              {actionLoading === "expedite" ? (
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
              ⚡ Hemen Gönder
            </button>
            <button
              onClick={() => doAction("pause", { subscriptionId: activeSub.id, pause: true })}
              disabled={actionLoading !== null}
              className="inline-flex items-center gap-2 bg-white border border-border hover:border-primary/40 text-heading px-5 py-2.5 text-sm font-medium transition disabled:opacity-50"
            >
              {actionLoading === "pause" ? (
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              ⏸ Planı Dondur
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-8 border-b border-border pb-4 overflow-x-auto">
        {[
          { key: "orders", label: "Siparişlerim", count: orders.length },
          { key: "subscriptions", label: "Aboneliklerim", count: subscriptions.length },
          { key: "loyalty", label: "Çekirdek Kredi" },
          { key: "wallet", label: "Cüzdan" },
          { key: "harvest", label: "Hasat Arşivi" },
          { key: "profile", label: "Profil" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`text-sm font-medium pb-4 -mb-4 border-b-2 transition whitespace-nowrap ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-heading"
            }`}>
            {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-primary font-bold text-sm">!</span></div>
              <p className="text-body mb-4">Henüz siparişiniz yok.</p>
              <Link href="/urunler" className="text-primary hover:text-primary-hover text-sm font-medium">Alışverişe Başla →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const steps = [
                  { key: "pending", label: "Sipariş Alındı" },
                  { key: "confirmed", label: "Onaylandı" },
                  { key: "shipped", label: "Kargoda" },
                  { key: "delivered", label: "Teslim Edildi" },
                ];
                const currentIdx = steps.findIndex(s => s.key === order.status);
                const isCancelled = order.status === "cancelled";
                return (
                <div key={order.id} className="bg-white border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-heading">Sipariş #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</p>
                      {order.estimatedDeliveryDate && (
                        <p className="text-[11px] text-primary font-medium mt-0.5">
                          Tahmini teslimat: {new Date(order.estimatedDeliveryDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded ${isCancelled ? "bg-red-100 text-red-700" : statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {isCancelled ? "İptal Edildi" : statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {steps.map((s, i) => (
                      <div key={s.key} className="flex items-center flex-1">
                        <div className={`flex items-center gap-1.5 ${i <= currentIdx && !isCancelled ? "text-primary" : "text-gray-300"}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i <= currentIdx && !isCancelled ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                          }`}>
                            {i < currentIdx && !isCancelled ? "✓" : i + 1}
                          </div>
                          <span className="text-[10px] hidden sm:inline whitespace-nowrap">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx && !isCancelled ? "bg-primary" : "bg-gray-200"}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-body">{item.product.name} × {item.quantity}</span>
                        <span className="text-heading font-medium">{(item.price * item.quantity).toLocaleString("tr-TR")}₺</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border mt-4 pt-3 flex justify-between">
                    <span className="text-sm font-bold text-heading">Toplam</span>
                    <span className="text-sm font-bold text-heading">{order.total.toLocaleString("tr-TR")}₺</span>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "subscriptions" && (
        <div>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-primary font-bold text-sm">!</span></div>
              <p className="text-body mb-4">Aktif aboneliğiniz bulunmuyor.</p>
              <Link href="/abonelik" className="text-primary hover:text-primary-hover text-sm font-medium">Abonelik Paketlerini İncele →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white border border-border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-heading">{sub.plan.name}</p>
                      <p className="text-sm text-body">{sub.plan.packageCount} paket · {sub.plan.price}₺/ay</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded ${
                      sub.status === "active" ? "bg-green-100 text-green-700" :
                      sub.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {sub.status === "active" ? "Aktif" : sub.status === "paused" ? "Duraklatıldı" : "İptal"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link href="/abonelik/yonetim" className="text-xs text-primary hover:text-primary-hover font-medium">Detaylar →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "loyalty" && <LoyaltyTab />}

      {tab === "wallet" && (
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Cüzdan Bakiyesi</p>
              <p className="text-3xl font-bold text-heading">{walletBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-base font-normal text-muted">TL</span></p>
            </div>
            <Link href="/cuzdan" className="bg-heading hover:bg-[#333] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition">Cüzdana Git →</Link>
          </div>
          <p className="text-xs text-muted">Cüzdanına para yükleyip ödemelerinde kullanabilir, işlem geçmişini görüntüleyebilirsin.</p>
        </div>
      )}

      {tab === "harvest" && (
        <HarvestArchive subscriptions={subscriptions} />
      )}

      {tab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white border border-border p-6 sm:p-8">
            <h2 className="text-lg font-bold text-heading mb-6">Profil Bilgilerim</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1">Ad Soyad</label>
                <p className="text-sm font-medium text-heading">{session.user?.name || "—"}</p>
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1">E-posta</label>
                <p className="text-sm font-medium text-heading">{session.user?.email}</p>
              </div>
            </div>
            <div className="border-t border-border mt-6 pt-6">
              <button onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg hover:bg-red-100 transition">
                Çıkış Yap
              </button>
            </div>
          </div>

          <AddressSection />
        </div>
      )}
    </div>
  );
}

export default function HesabimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <HesabimContent />
    </Suspense>
  );
}
