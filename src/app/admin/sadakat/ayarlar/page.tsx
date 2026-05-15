"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Settings = {
  pointsPerLira: number;
  pointsToLira: number;
  minRedeemPoints: number;
  maxDiscountPct: number;
  bronzeMin: number;
  bronzeMax: number;
  silverMin: number;
  silverMax: number;
  goldMin: number;
  goldMax: number;
  bronzeShippingThreshold: number;
  silverShippingThreshold: number;
  goldShippingThreshold: number;
  bronzeDiscountPct: number;
  silverDiscountPct: number;
  goldDiscountPct: number;
  welcomePoints: number;
  welcomeDiscountPct: number;
  birthdayPoints: number;
  referralPoints: number;
  referralFriendPct: number;
  subscriptionDiscountPct: number;
};

const defaultSettings: Settings = {
  pointsPerLira: 1,
  pointsToLira: 0.05,
  minRedeemPoints: 100,
  maxDiscountPct: 50,
  bronzeMin: 0,
  bronzeMax: 500,
  silverMin: 500,
  silverMax: 2000,
  goldMin: 2000,
  goldMax: 999999,
  bronzeShippingThreshold: 990,
  silverShippingThreshold: 500,
  goldShippingThreshold: 0,
  bronzeDiscountPct: 0,
  silverDiscountPct: 3,
  goldDiscountPct: 5,
  welcomePoints: 500,
  welcomeDiscountPct: 10,
  birthdayPoints: 300,
  referralPoints: 100,
  referralFriendPct: 10,
  subscriptionDiscountPct: 5,
};

type FieldDef = { key: keyof Settings; label: string; suffix?: string; group: string };

const fields: FieldDef[] = [
  // Puan
  { key: "pointsPerLira", label: "1₺ başına puan", group: "puan" },
  { key: "pointsToLira", label: "Puan değeri (1 puan = ₺)", group: "puan" },
  { key: "minRedeemPoints", label: "Min. kullanım puanı", group: "puan" },
  { key: "maxDiscountPct", label: "Maks. indirim oranı", suffix: "%", group: "puan" },
  // Seviye - Bronz
  { key: "bronzeMin", label: "Bronz min. harcama", suffix: "₺", group: "bronz" },
  { key: "bronzeMax", label: "Bronz max. harcama", suffix: "₺", group: "bronz" },
  { key: "bronzeDiscountPct", label: "Bronz indirim", suffix: "%", group: "bronz" },
  { key: "bronzeShippingThreshold", label: "Bronz kargo eşiği", suffix: "₺", group: "bronz" },
  // Seviye - Gümüş
  { key: "silverMin", label: "Gümüş min. harcama", suffix: "₺", group: "gumus" },
  { key: "silverMax", label: "Gümüş max. harcama", suffix: "₺", group: "gumus" },
  { key: "silverDiscountPct", label: "Gümüş indirim", suffix: "%", group: "gumus" },
  { key: "silverShippingThreshold", label: "Gümüş kargo eşiği", suffix: "₺", group: "gumus" },
  // Seviye - Altın
  { key: "goldMin", label: "Altın min. harcama", suffix: "₺", group: "altin" },
  { key: "goldMax", label: "Altın max. harcama", suffix: "₺", group: "altin" },
  { key: "goldDiscountPct", label: "Altın indirim", suffix: "%", group: "altin" },
  { key: "goldShippingThreshold", label: "Altın kargo eşiği", suffix: "₺", group: "altin" },
  // Bonus
  { key: "welcomePoints", label: "Hoş geldin puanı", group: "bonus" },
  { key: "welcomeDiscountPct", label: "Hoş geldin indirimi", suffix: "%", group: "bonus" },
  { key: "birthdayPoints", label: "Doğum günü puanı", group: "bonus" },
  { key: "referralPoints", label: "Referans puanı", group: "bonus" },
  { key: "referralFriendPct", label: "Referans arkadaş indirimi", suffix: "%", group: "bonus" },
  // Abonelik
  { key: "subscriptionDiscountPct", label: "Abonelik indirimi", suffix: "%", group: "abonelik" },
];

const sampleAmounts = [50, 100, 250, 500, 1000, 2000, 5000];

function formatNum(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SadakatAyarlarPage() {
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

  const exportCSV = useCallback(() => {
    const rows = [
      ["Harcama (₺)", "Kazanılan Puan", "İndirim Değeri (₺)", "Oran (%)"].join(","),
      ...sampleAmounts.map((amt) => {
        const pts = Math.round(amt * settings.pointsPerLira);
        const val = pts * settings.pointsToLira;
        const rate = (val / amt) * 100;
        return [amt, pts, formatNum(val), formatNum(rate)].join(",");
      }),
    ];

    const tierRows = [
      "",
      "Seviye,Harcama Aralığı,İndirim %,Kargo Eşiği (₺)",
      `Bronz,${settings.bronzeMin}-${settings.bronzeMax} ₺,${settings.bronzeDiscountPct},${settings.bronzeShippingThreshold}`,
      `Gümüş,${settings.silverMin}-${settings.silverMax} ₺,${settings.silverDiscountPct},${settings.silverShippingThreshold}`,
      `Altın,${settings.goldMin}+ ₺,${settings.goldDiscountPct},${settings.goldShippingThreshold === 0 ? "Bedava" : settings.goldShippingThreshold}`,
    ];

    const allRows = [...rows, ...tierRows];
    const blob = new Blob([allRows.join("\n")], { type: "text/csv;charset=utf-8;charset=utf-8-bom" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rostello-altin-orani.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [settings]);

  const copyTable = useCallback(() => {
    const lines = [
      "Rostello Sadakat - Altın Oranı Tablosu",
      "",
      "Harcama (₺)\tKazanılan Puan\tİndirim Değeri (₺)\tOran (%)",
      ...sampleAmounts.map((amt) => {
        const pts = Math.round(amt * settings.pointsPerLira);
        const val = pts * settings.pointsToLira;
        const rate = (val / amt) * 100;
        return `${amt}\t${pts}\t${formatNum(val)}\t${formatNum(rate)}`;
      }),
      "",
      "Seviye\tHarcama Aralığı\tİndirim %\tKargo Eşiği",
      `Bronz\t${settings.bronzeMin}-${settings.bronzeMax} ₺\t%${settings.bronzeDiscountPct}\t${settings.bronzeShippingThreshold} ₺`,
      `Gümüş\t${settings.silverMin}-${settings.silverMax} ₺\t%${settings.silverDiscountPct}\t${settings.silverShippingThreshold} ₺`,
      `Altın\t${settings.goldMin}+ ₺\t%${settings.goldDiscountPct}\t${settings.goldShippingThreshold === 0 ? "Bedava" : settings.goldShippingThreshold} ₺`,
    ].join("\n");

    navigator.clipboard.writeText(lines).then(() => {
      setMessage("Tabloya kopyalandı ✓");
      setTimeout(() => setMessage(""), 2000);
    });
  }, [settings]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-amber-600">Yükleniyor...</p>
      </div>
    );
  }

  const groupLabels: Record<string, string> = {
    puan: "Puan Sistemi",
    bronz: "Bronz Seviye",
    gumus: "Gümüş Seviye",
    altin: "Altın Seviye",
    bonus: "Bonus & Referans",
    abonelik: "Abonelik",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Ayarlar & Altın Oranı</h1>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm text-green-600 font-medium">{message}</span>}
          <button onClick={save} disabled={saving} className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Settings Form - Excel-like editable fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(groupLabels).map(([groupId, groupLabel]) => {
          const groupFields = fields.filter((f) => f.group === groupId);
          if (groupFields.length === 0) return null;
          return (
            <div key={groupId} className="bg-white rounded-xl border border-amber-100 p-5">
              <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-4 pb-2 border-b border-amber-100">{groupLabel}</h2>
              <div className="space-y-3">
                {groupFields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="any"
                        value={settings[f.key]}
                        onChange={(e) => update(f.key, e.target.value)}
                        className="w-full border border-[#e5e0d8] rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      {f.suffix && <span className="text-xs text-gray-400 w-4">{f.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Altın Oranı Hesaplama Tablosu */}
      <div className="bg-white rounded-xl border border-amber-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-900">Altın Oranı Hesaplama Tablosu</h2>
          <div className="flex gap-2">
            <button onClick={copyTable} className="text-xs border border-amber-200 text-amber-700 px-3 py-1.5 rounded hover:bg-amber-50 transition">
              Kopyala
            </button>
            <button onClick={exportCSV} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-500 transition">
              CSV İndir
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-amber-200">
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">Harcama (₺)</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">Kazanılan Puan</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">İndirim Değeri (₺)</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">Oran (%)</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">Kargo Durumu</th>
              </tr>
            </thead>
            <tbody>
              {sampleAmounts.map((amt) => {
                const pts = Math.round(amt * settings.pointsPerLira);
                const val = pts * settings.pointsToLira;
                const rate = (val / amt) * 100;
                let kargo = "—";
                if (amt >= settings.bronzeShippingThreshold) {
                  if (settings.goldShippingThreshold === 0) {
                    kargo = "Altın'a bedava";
                  } else if (amt >= settings.goldShippingThreshold) {
                    kargo = "✓ Ücretsiz";
                  } else {
                    kargo = `${settings.bronzeShippingThreshold} ₺ üzeri`;
                  }
                } else {
                  kargo = `${settings.bronzeShippingThreshold} ₺ üzeri`;
                }
                return (
                  <tr key={amt} className="border-b border-amber-50 hover:bg-amber-50/50 transition">
                    <td className="py-3 px-4 font-medium text-gray-800">{amt.toLocaleString("tr-TR")}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">{pts.toLocaleString("tr-TR")}</td>
                    <td className="py-3 px-4 text-right font-mono text-green-700 font-semibold">{formatNum(val)}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">{formatNum(rate)}</td>
                    <td className="py-3 px-4 text-right text-xs text-gray-500">{kargo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>Özet:</strong> {settings.pointsPerLira} ₺ = 1 puan · 1 puan = {settings.pointsToLira} ₺ · 
            Maksimum indirim: sepetin %{settings.maxDiscountPct}'si · Min. kullanım: {settings.minRedeemPoints} puan
          </p>
        </div>
      </div>

      {/* Seviye Karşılaştırma Tablosu */}
      <div className="bg-white rounded-xl border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-amber-900 mb-4">Seviye Karşılaştırma</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-amber-200">
                <th className="text-left py-3 px-4 text-amber-900 font-semibold">Seviye</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">Harcama Aralığı</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">İndirim %</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">Kargo Eşiği</th>
                <th className="text-right py-3 px-4 text-amber-900 font-semibold">Puan Çarpanı</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Bronz", min: settings.bronzeMin, max: settings.bronzeMax, pct: settings.bronzeDiscountPct, ship: settings.bronzeShippingThreshold, mult: 1 },
                { name: "Gümüş", min: settings.silverMin, max: settings.silverMax, pct: settings.silverDiscountPct, ship: settings.silverShippingThreshold, mult: 1.2 },
                { name: "Altın", min: settings.goldMin, max: settings.goldMax, pct: settings.goldDiscountPct, ship: settings.goldShippingThreshold, mult: 1.5 },
              ].map((t) => (
                <tr key={t.name} className="border-b border-amber-50 hover:bg-amber-50/50 transition">
                  <td className="py-3 px-4 font-semibold text-gray-800">{t.name}</td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {t.min.toLocaleString("tr-TR")} - {t.max >= 999999 ? "∞" : t.max.toLocaleString("tr-TR")} ₺
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-700">%{t.pct}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{t.ship === 0 ? "Bedava" : `${t.ship} ₺`}</td>
                  <td className="py-3 px-4 text-right font-mono text-amber-700">×{t.mult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
