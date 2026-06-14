"use client";

import { useEffect, useState, useCallback } from "react";

type Settings = {
  earnRatePct: number;
  pendingDays: number;
  monthlyCapKurus: number;
  freeShippingThresholdKurus: number;
  shippingCostKurus: number;

  referralRewardKurus: number;
  referralFriendDiscountPct: number;
  subscriptionDiscountPct: number;
  dailyRoastCapacity: number;
  greenBeanThreshold: number;
};

type FieldDef = {
  key: keyof Settings;
  label: string;
  desc?: string;
  suffix?: string;
  step?: string;
  isTL?: boolean;
  group: string;
};

const fields: FieldDef[] = [
  { key: "earnRatePct", label: "Kazanım Oranı", desc: "Kahve alışverişinde kazanılacak %", suffix: "%", step: "0.1", group: "kazanim" },
  { key: "monthlyCapKurus", label: "Aylık Limit", desc: "Bir üyenin ayda kazanabileceği maksimum kredi", suffix: "TL", step: "0.01", isTL: true, group: "kazanim" },
  { key: "pendingDays", label: "Bekleme Günü", desc: "Kredilerin kullanıma açılması için beklenen gün (0 = anında)", suffix: "gün", group: "kargo" },
  { key: "freeShippingThresholdKurus", label: "Ücretsiz Kargo Eşiği", desc: "Bu tutar üzeri siparişlerde kargo ücretsiz", suffix: "TL", step: "0.01", isTL: true, group: "kargo" },
  { key: "shippingCostKurus", label: "Kargo Ücreti", desc: "Kargo eşiği altındaki siparişlerde kesilecek tutar", suffix: "TL", step: "0.01", isTL: true, group: "kargo" },
  { key: "dailyRoastCapacity", label: "Günlük Kavrum Kapasitesi", desc: "Bir günde işlenebilecek maksimum sipariş sayısı. Aşılınca teslimat süresi otomatik uzar.", suffix: "sipariş", group: "kargo" },
  { key: "greenBeanThreshold", label: "Yeşil Çekirdek Eşiği", desc: "Bu değerin altındaki yeşil çekirdek stoğunda 'Tükenmek Üzere' rozeti gösterilir.", suffix: "kg", group: "kargo" },

  { key: "referralRewardKurus", label: "Referans Ödülü", desc: "Arkadaşını getirene verilen kredi", suffix: "TL", step: "0.01", isTL: true, group: "bonus" },
  { key: "referralFriendDiscountPct", label: "Referans Arkadaş İndirimi", desc: "Davet edilen arkadaşa verilen indirim", suffix: "%", step: "0.1", group: "bonus" },
  { key: "subscriptionDiscountPct", label: "Abonelik İndirimi", desc: "Aktif abonelere verilen indirim", suffix: "%", step: "0.1", group: "abonelik" },
];

const defaultSettings: Settings = {
  earnRatePct: 5.0,
  pendingDays: 14,
  monthlyCapKurus: 150000,
  freeShippingThresholdKurus: 100000,
  shippingCostKurus: 15000,

  referralRewardKurus: 10000,
  referralFriendDiscountPct: 10,
  subscriptionDiscountPct: 5,
  dailyRoastCapacity: 50,
  greenBeanThreshold: 20,
};

export default function CekirdekKrediAyarlarPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/sadakat/ayarlar")
      .then((r) => r.json())
      .then((d) => { if (d.id) setSettings(d); })
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback((key: keyof Settings, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setSettings((prev) => ({ ...prev, [key]: num }));
    }
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/sadakat/ayarlar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Kaydedildi ✓");
      } else {
        setMessage("Hata oluştu");
      }
    } catch {
      setMessage("Hata oluştu");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }, [settings]);

  const kuruSToTLAyarlar = (s: Settings) => ({
    monthlyCap: s.monthlyCapKurus / 100,
    freeShippingThreshold: s.freeShippingThresholdKurus / 100,
    shippingCost: s.shippingCostKurus / 100,

    referralReward: s.referralRewardKurus / 100,
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-amber-600">Yükleniyor...</p>
      </div>
    );
  }

  const tl = kuruSToTLAyarlar(settings);

  const groupLabels: Record<string, { title: string; icon: string }> = {
    kazanim: { title: "Kazanım Ayarları", icon: "💰" },
    kargo: { title: "Bekleme & Kargo", icon: "🚚" },
    bonus: { title: "Referans", icon: "🎁" },
    abonelik: { title: "Abonelik", icon: "📦" },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Çekirdek Kredi Ayarları</h1>
          <p className="text-sm text-amber-600 mt-1">Tüm Çekirdek Kredi programı parametrelerini buradan yönetin.</p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm text-green-600 font-medium">{message}</span>}
          <button onClick={save} disabled={saving} className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Object.entries(groupLabels).map(([groupId, gl]) => {
          const groupFields = fields.filter((f) => f.group === groupId);
          if (groupFields.length === 0) return null;
          return (
            <div key={groupId} className="bg-white rounded-xl border border-amber-100 p-5">
              <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-4 pb-2 border-b border-amber-100">
                {gl.icon} {gl.title}
              </h2>
              <div className="space-y-4">
                {groupFields.map((f) => {
                  const displayVal = f.isTL
                    ? (settings[f.key] / 100).toFixed(2)
                    : settings[f.key].toString();
                  return (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                      {f.desc && <p className="text-[10px] text-gray-400 mb-1">{f.desc}</p>}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step={f.step || "1"}
                          value={displayVal}
                          onChange={(e) => {
                            const raw = parseFloat(e.target.value);
                            if (!isNaN(raw)) {
                              const val = f.isTL ? Math.round(raw * 100) : raw;
                              setSettings((prev) => ({ ...prev, [f.key]: val }));
                            }
                          }}
                          className="w-full border border-border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-amber-400 font-mono"
                        />
                        <span className="text-xs text-gray-400 w-8">{f.suffix}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Özet Kartı */}
      <div className="bg-white rounded-xl border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-amber-900 mb-4">📋 Program Özeti</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Kazanım Oranı</p>
            <p className="text-lg font-bold text-amber-900">%{settings.earnRatePct}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Aylık Limit</p>
            <p className="text-lg font-bold text-amber-900">{tl.monthlyCap.toLocaleString("tr-TR")} TL</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Ücretsiz Kargo</p>
            <p className="text-lg font-bold text-amber-900">{tl.freeShippingThreshold.toLocaleString("tr-TR")} TL</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Kargo Ücreti</p>
            <p className="text-lg font-bold text-amber-900">{tl.shippingCost.toLocaleString("tr-TR")} TL</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Bekleme</p>
            <p className="text-lg font-bold text-amber-900">{settings.pendingDays} gün</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Günlük Kapasite</p>
            <p className="text-lg font-bold text-amber-900">{settings.dailyRoastCapacity} sipariş</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Çekirdek Eşiği</p>
            <p className="text-lg font-bold text-amber-900">{settings.greenBeanThreshold} kg</p>
          </div>

          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Referans Ödülü</p>
            <p className="text-lg font-bold text-amber-900">{tl.referralReward.toLocaleString("tr-TR")} TL</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Arkadaş İndirimi</p>
            <p className="text-lg font-bold text-amber-900">%{settings.referralFriendDiscountPct}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600">Abonelik İndirimi</p>
            <p className="text-lg font-bold text-amber-900">%{settings.subscriptionDiscountPct}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
